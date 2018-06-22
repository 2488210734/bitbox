{
	"name": "BadResponseError",
	"message": "Transaction submission failed. Server responded: 400 Bad Request",
	"data": {
		"type": "https://stellar.org/horizon-errors/transaction_failed",
		"title": "Transaction Failed",
		"status": 400,
		"detail": "The transaction failed when submitted to the stellar network. The `extras.result_codes` field on this response contains further details.  Descriptions of each code can be found at: https://www.stellar.org/developers/learn/concepts/list-of-operations.html",
		"extras": {
			"envelope_xdr": "AAAAAGcq5+EnKaWc5TBq6YoD1OIbcZraGZnWOMyUYMBitIFBAAAAZAEXLfsAAAAbAAAAAAAAAAAAAAABAAAAAAAAAAYAAAABU0RBAAAAAABddtjBD+RttqgH3a6z6URleHFKps2ARSQrIXlHYHl2qAAACRhOcqAAAAAAAAAAAAFitIFBAAAAQNstljnwVVyUtfoZtgj+ScptPa66BBDTONlyAsW3BtTI3Z8rg+X3kyTOHpyubDD4/SUdNA6YLvDV46Z3cajTOQA=",
			"result_codes": {
				"transaction": "tx_failed",
				"operations": ["op_low_reserve"]
			},
			"result_xdr": "AAAAAAAAAGT/////AAAAAQAAAAAAAAAG/////AAAAAA="
		}
	}
}