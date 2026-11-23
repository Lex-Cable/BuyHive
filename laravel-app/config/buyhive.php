<?php

return [
    'default_commission_rate' => (float) env('BUYHIVE_DEFAULT_COMMISSION_RATE', 12.00),
    'sandbox_payments' => (bool) env('BUYHIVE_SANDBOX_PAYMENTS', true),
    'management_webhook_secret' => env('BUYHIVE_MANAGEMENT_WEBHOOK_SECRET', ''),

    'payment_methods' => [
        'mpesa' => ['enabled' => true, 'label' => 'M-Pesa STK Push', 'priority' => 1],
        'card' => ['enabled' => true, 'label' => 'Visa / Mastercard', 'priority' => 2],
        'paypal' => ['enabled' => true, 'label' => 'PayPal', 'priority' => 3],
        'bank' => ['enabled' => true, 'label' => 'Bank Online Transfer', 'priority' => 4],
    ],

    'feedback_policy' => [
        'allow_duplicate_per_order' => false,
        'points_awarded' => 50,
    ],
];
