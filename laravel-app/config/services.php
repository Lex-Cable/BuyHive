<?php
return [
 'mailgun'=>['domain'=>env('MAILGUN_DOMAIN'),'secret'=>env('MAILGUN_SECRET'),'endpoint'=>env('MAILGUN_ENDPOINT','api.mailgun.net'),'scheme'=>'https'],
 'postmark'=>['token'=>env('POSTMARK_TOKEN')],
 'ses'=>['key'=>env('AWS_ACCESS_KEY_ID'),'secret'=>env('AWS_SECRET_ACCESS_KEY'),'region'=>env('AWS_DEFAULT_REGION','us-east-1')],
 'mpesa'=>['environment'=>env('MPESA_ENV','sandbox'),'consumer_key'=>env('MPESA_CONSUMER_KEY'),'consumer_secret'=>env('MPESA_CONSUMER_SECRET'),'shortcode'=>env('MPESA_SHORTCODE','174379'),'passkey'=>env('MPESA_PASSKEY'),'callback_url'=>env('MPESA_CALLBACK_URL'),'callback_secret'=>env('MPESA_CALLBACK_SECRET')],
 'stripe'=>['key'=>env('STRIPE_KEY'),'secret'=>env('STRIPE_SECRET'),'webhook_secret'=>env('STRIPE_WEBHOOK_SECRET')],
 'paypal'=>['mode'=>env('PAYPAL_MODE','sandbox'),'client_id'=>env('PAYPAL_CLIENT_ID'),'client_secret'=>env('PAYPAL_CLIENT_SECRET')],
];
