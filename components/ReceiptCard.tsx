import { Receipt } from '../types/receipts'
import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'

type Props = { receipt: Receipt }

export default function ReceiptCard({ receipt }: Props) {
	const { vendor, total, receipt_date, currency, id } = receipt
	const router = useRouter()

	return (
		<Pressable onPress={() => router.push(`/review/${id}`)}>
			<View className='flex-row rounded-2xl m-2 w-100 bg-gray-300 justify-between align-center'>
				<View className='flex p-3'>
					<Text className='text-black font-semibold'>{vendor}</Text>
					<Text className='text-gray-500 '>{receipt_date}</Text>
				</View>
				<View className='flex-row p-3'>
					<Text className='text-black font-semibold'>{total}{' '}</Text>
					<Text className='text-black font-semibold'>{currency}</Text>
				</View>
			</View>
		</Pressable>
	)
}
