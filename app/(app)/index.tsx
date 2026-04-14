import { useState, useEffect } from 'react'
import { Text, View, FlatList, TouchableOpacity } from 'react-native'
import { Receipt } from '../../types/receipts'
import { supabase } from '../../lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'expo-router'
import ReceiptCard from '../../components/ReceiptCard'

export default function HomeScreen() {
	const [receipts, setReceipts] = useState<Receipt[]>([])
	const [user, setUser] = useState<User | null>(null)
	const [error, setError] = useState<string>('')
  const router  = useRouter();

	useEffect(() => {
		const getSession = async () => {
			const { data, error } = await supabase.auth.getSession()
			if (error) {
				setError(error.message)
			} else {
				const { session } = data
				setUser(session?.user ?? null)
        fetchReceipts(session?.user ?? null)
			}
		}

		const fetchReceipts = async (user: User | null) => {
			if (user) {
				const { data, error } = await supabase
					.from('receipts')
					.select(
						'id, title, vendor, receipt_date, total, currency, parse_status',
					)
					.eq('user_id', user.id)

				if (data) {
					setReceipts(data)
				}
			}
		}

		getSession()
	}, [])

	return (
		<View className='flex-1 justify-center'>
			<Text>Recent</Text>
			<FlatList
				data={receipts}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<ReceiptCard receipt={item} />
				)}
				ListEmptyComponent={<Text>No receipts yet</Text>}
			/>
			<TouchableOpacity
				onPress={() => router.push('/scan')}
				className='absolute bottom-8 self-center bg-black p-4 rounded-xl items-center'>
				<Text className='text-white font-semibold text-base'>Add</Text>
			</TouchableOpacity>
			{error && <Text>{error}</Text>}
		</View>
	)
}
