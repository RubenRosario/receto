import {
	Text,
	TextInput,
	Alert,
	View,
	ScrollView,
	TouchableOpacity,
} from 'react-native'
import { useState, useEffect } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { Receipt, ReceiptItem } from '../../../types/receipts'
import { supabase } from '../../../lib/supabase'

export default function Review() {
	const { id } = useLocalSearchParams()
	const [receipt, setReceipt] = useState<Receipt | null>(null)
	const [items, setItems] = useState<ReceiptItem[]>([])
	const [loading, setLoading] = useState<boolean>(false)

	useEffect(() => {
		const fetchReceipt = async () => {
			setLoading(true)
			const { data: receiptData, error: receiptError } = await supabase
				.from('receipts')
				.select(
					'id, title, vendor, receipt_date, total, currency, parse_status',
				)
				.eq('id', id)
				.single()

			if (receiptError) {
				Alert.alert('Error fetching receipt', receiptError.message)
				setLoading(false)
			}

			setReceipt(receiptData as Receipt)

			const { data: itemsData, error: itemsError } = await supabase
				.from('receipt_items')
				.select('id, name, quantity, unit_price, line_total')
				.eq('receipt_id', id)

			if (itemsError) {
				Alert.alert('Error fetching receipt items', itemsError.message)
				setLoading(false)
			}

			setItems(itemsData as ReceiptItem[])
			setLoading(false)
		}

		fetchReceipt()
	}, [])

	const handleInputChange = (field: string, value: string, itemId?: string) => {
		if (itemId) {
			setItems((prev) =>
				prev.map((item) =>
					item.id === itemId ? { ...item, [field]: value } : item,
				),
			)
		} else {
			setReceipt((prev) => (prev ? { ...prev, [field]: value } : prev))
		}
	}

	const handleConfirmBtn = async () => {
		// update the receipts if data changed

		const { data, error } = await supabase
			.from('receipts')
			.update({ parse_status: 'confirmed' })
			.eq('id', id)

		if (error) {
			Alert.alert('Confirmation error:', error.message)
		}
		router.replace('/')
	}

	return (
		<ScrollView contentContainerClassName='px-6 py-6 flex-1 flex-column gap-2'>
			<Text className='text-sm text-gray-500 mb-1'>Vendor</Text>
			<TextInput
				className='w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900'
				value={receipt?.vendor}
				onChangeText={(value) => handleInputChange('vendor', value)}
			/>
			<Text className='text-sm text-gray-500 mb-1'>Date</Text>
			<TextInput
				className='w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900'
				value={receipt?.receipt_date}
				onChangeText={(value) => handleInputChange('receipt_date', value)}
			/>
			<Text className='text-sm text-gray-500 mb-1'>Items</Text>
			{items.map((item) => (
				<View key={item.id} className='flex flex-row'>
					<TextInput
						className='border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900'
						numberOfLines={1}
						value={item.name ?? 'unknown'}
						onChangeText={(value) => handleInputChange('name', value, item.id)}
					/>
					<TextInput
						className='border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900'
						numberOfLines={1}
						value={String(item.line_total) ?? 0}
						onChangeText={(value) => handleInputChange('line_total', value, item.id)}
					/>
				</View>
			))}
			<Text className='text-sm text-gray-500 mb-1'>Total</Text>
			<TextInput
				className='w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900'
				value={String(receipt?.total)}
				onChangeText={(value) => handleInputChange('total', value)}
			/>
			<TouchableOpacity
				className='w-full bg-black py-4 rounded-xl items-center absolute bottom-8 self-center'
				onPress={handleConfirmBtn}>
				<Text className='text-white font-semibold text-base'>Confirm</Text>
			</TouchableOpacity>
		</ScrollView>
	)
}
