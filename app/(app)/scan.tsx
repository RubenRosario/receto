import { View, Text, TouchableOpacity } from 'react-native'
import { useCameraPermissions, CameraView } from 'expo-camera'
import { useState, useRef } from 'react'

export default function Scan() {
	const [permission, requestPermission] = useCameraPermissions()
	const [pictureUri, setPictureUri] = useState<string>('')
	const permissionGranted = permission?.granted
	const cameraRef = useRef<CameraView>(null);

	const handleButtonPress = async () => {
		if (cameraRef.current){
			const {uri} = await cameraRef.current.takePictureAsync()
			setPictureUri(uri);
			console.log(uri)

		}
	}

	if (!permission) {
		return <Text>Waiting for permission</Text>
	}

	if (!permissionGranted) {
		return (
			<TouchableOpacity className='bg-black p-4 rounded-xl items-center' onPress={requestPermission}>
				<Text className='text-white font-semibold text-base'>Request Permission</Text>
			</TouchableOpacity>
		)
	}

	if (permissionGranted) {
		return (
			<View className='flex-1'>
				<CameraView ref={cameraRef} style={{ flex: 1 }} />
				<TouchableOpacity className='absolute bottom-8 self-center h-20 w-20 bg-red-500 rounded-full' onPress={handleButtonPress}></TouchableOpacity>
			</View>
		)
	}
}
