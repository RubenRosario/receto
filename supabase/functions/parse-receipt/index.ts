// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import '@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
	const { receiptId, imagePath } = await req.json()

	const supabase = createClient(
		Deno.env.get('SUPABASE_URL'),
		Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
	)

	// download the image from supabase storage
	const { data, error } = await supabase.storage
		.from('receipts')
		.download(imagePath)

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		})
	}

	// convert the image to base64
	const arrayBuffer = await data.arrayBuffer()
	const uint8Array = new Uint8Array(arrayBuffer)
	let binary = ''
	for (const byte of uint8Array) {
		binary += String.fromCharCode(byte)
	}
	const base64 = btoa(binary)

	// Make the request to OpenAI for parsing the receipt data
	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			model: 'gpt-4o',
			messages: [
				{
					role: 'user',
					content: [
						{
							type: 'image_url',
							image_url: {
								url: `data:image/jpeg;base64,${base64}`,
							},
						},
						{
							type: 'text',
							text: `Extract the receipt data and return a JSON object with these fields:
              - vendor (string)
              - receipt_date (string, format: YYYY-MM-DD)
              - total (number)
              - currency (string, 3-letter code e.g. EUR)
              - items (array of { name, quantity, unit_price, line_total })
              Return only valid JSON, no explanation.`,
						},
					],
				},
			],
			max_tokens: 1000,
		}),
	})

	const result = await response.json()

	if (!result.choices?.[0]?.message?.content) {
		return new Response(JSON.stringify({ error: 'AI parsing failed' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		})
	}

	// extract the required data from OpenAI's response in json format
	const content = result.choices[0].message.content
	const json = content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1)
	const parsed = JSON.parse(json)
	console.log('Parsed:', parsed)

	// update receipts and receipt_items
	const { error: updateError } = await supabase
		.from('receipts')
		.update({
			vendor: parsed.vendor,
			receipt_date: parsed.receipt_date,
			total: parsed.total,
			currency: parsed.currency,
			parse_status: 'parsed',
			raw_ai_response: result,
		})
		.eq('id', receiptId)

	if (updateError) {
		return new Response(JSON.stringify({ error: updateError.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		})
	}

	const { error: insertError } = await supabase.from('receipt_items').insert(
		parsed.items.map((item: any) => ({
			receipt_id: receiptId,
			name: item.name,
			quantity: item.quantity,
			unit_price: item.unit_price,
			line_total: item.line_total,
		})),
	)

	if (insertError) {
		return new Response(JSON.stringify({ error: insertError.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		})
	}

	return new Response(JSON.stringify(parsed), {
		headers: { 'Content-Type': 'application/json' },
	})
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/parse-receipt' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
