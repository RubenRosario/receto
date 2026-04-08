import { View, Text, TouchableOpacity, Image, Alert } from 'react-native'
import { useCameraPermissions, CameraView } from 'expo-camera'
import { useState, useRef } from 'react'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid'

export default function Scan() {
	const [permission, requestPermission] = useCameraPermissions()
	const [pictureUri, setPictureUri] = useState<string | null>(null)
	const permissionGranted = permission?.granted
	const cameraRef = useRef<CameraView>(null)
	const router = useRouter()

	const handleTakePictureBtnPress = async () => {
		if (cameraRef.current) {
			const { uri } = await cameraRef.current.takePictureAsync()
			setPictureUri(uri)
		}
	}

	const handleUpload = async () => {
		const { data: sessionData, error: sessionError } =
			await supabase.auth.getSession()

		if (sessionError || !sessionData.session) {
			Alert.alert('Session Error', sessionError?.message ?? 'Unknown Error')
			return
		}

		const userId = sessionData.session.user.id
		const receiptId = uuidv4()

		const formData = new FormData();
		formData.append('file', {
				uri: pictureUri,
				type: 'image/jpeg',
				name: 'photo.jpg',
		} as any)

		const { data:uploadData, error: uploadError } = await supabase.storage
			.from('receipts')
			.upload(`${userId}/${receiptId}.jpg`, formData, {contentType: 'image/jpeg'})

		if (!uploadData || uploadError) {
			Alert.alert('Upload Error', uploadError?.message ?? 'Unknown Error')
			return
		}

		const { error: insertError} = await supabase.from('receipts').insert({
			id: receiptId,
			user_id: userId,
			image_path: uploadData.path,
			parse_status: 'pending'
		});

		if (insertError){
			Alert.alert('Insert Error', insertError.message)
			return
		}
	}

	if (!permission) {
		return <Text>Waiting for permission</Text>
	}

	if (!permissionGranted) {
		return (
			<TouchableOpacity
				className='bg-black p-4 rounded-xl items-center'
				onPress={requestPermission}>
				<Text className='text-white font-semibold text-base'>
					Request Permission
				</Text>
			</TouchableOpacity>
		)
	}

	if (permissionGranted) {
		return pictureUri ? (
			<View className='flex-1'>
				<Image source={{ uri: pictureUri }} style={{ flex: 1 }} />
				<TouchableOpacity
					className='absolute bottom-8 left-2 bg-black p-4 rounded-xl'
					onPress={() => {
						setPictureUri(null)
					}}>
					<Text className='text-white font-semibold'>Retake</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className='absolute bottom-8 right-2 bg-black p-4 rounded-xl'
					onPress={handleUpload}>
					<Text className='text-white font-semibold'>Use Photo</Text>
				</TouchableOpacity>
			</View>
		) : (
			<View className='flex-1'>
				<CameraView ref={cameraRef} style={{ flex: 1 }} />
				<TouchableOpacity
					className='absolute top-8 right-8 bg-transparent'
					onPress={() => router.back()}>
					<Text className='text-white text-5xl font-bold'>X</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className='absolute bottom-8 self-center h-20 w-20 bg-red-500 rounded-full'
					onPress={handleTakePictureBtnPress}></TouchableOpacity>
			</View>
		)
	}
}
