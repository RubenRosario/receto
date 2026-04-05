import { useState } from 'react'
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Keyboard,
	TouchableWithoutFeedback,
} from 'react-native'
import { supabase } from '../../lib/supabase'
import { Link } from 'expo-router'

export default function SignIn() {
	const [email, setEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)

	const handleSignIn = () => {
		setLoading(true)
		supabase.auth.signInWithPassword({ email, password }).then(({ error }) => {
			if (error) {
				setError(error.message)
			}
			setLoading(false)
		})
	}

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View className='flex-1 flex-col items-center justify-center gap-3 w-full px-6'>
				<TextInput
					className='w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900'
					placeholder='Email'
					value={email}
					onChangeText={setEmail}
				/>
				<TextInput
					className='w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900'
					placeholder='Password'
					value={password}
					secureTextEntry={true}
					autoCapitalize='none'
					onChangeText={setPassword}
				/>

				<TouchableOpacity
					className='w-full bg-black py-4 rounded-xl items-center'
					onPress={handleSignIn}>
					<Text className='text-white font-semibold text-base'>
						{loading ? 'Loading...' : 'Sign In'}
					</Text>
				</TouchableOpacity>

				<Text>
					If you don't have an account{' '}
					<Link className='text-black font-semibold' href='/sign-up'>
						<Text>create one here</Text>
					</Link>
				</Text>

				{error && !loading && (
					<Text className='text-red-500 font-semibold'>{error}</Text>
				)}
			</View>
		</TouchableWithoutFeedback>
	)
}
