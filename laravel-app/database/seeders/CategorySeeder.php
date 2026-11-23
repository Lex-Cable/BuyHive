<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $taxonomy = [
            'Electronics' => ['Smartphones', 'Tablets', 'Computers', 'Laptops', 'Televisions', 'Cameras', 'Audio equipment', 'Gaming accessories', 'Smart devices', 'Computer accessories'],
            'Fashion and Clothing' => ["Women's clothing", "Men's clothing", "Children's clothing", 'Shoes', 'Handbags', 'Accessories', 'Jewellery', 'Watches', 'Traditional clothing'],
            'Beauty and Personal Care' => ['Skincare', 'Haircare', 'Cosmetics', 'Makeup', 'Fragrances', 'Bath and body products', 'Grooming equipment'],
            'Home, Furniture and Living' => ['Sofas', 'Beds', 'Mattresses', 'Tables', 'Chairs', 'Kitchen equipment', 'Dining products', 'Home décor', 'Lighting', 'Bedding', 'Storage'],
            'Baby, Kids and Maternity' => ['Baby clothing', 'Diapers', 'Feeding equipment', 'Baby furniture', 'Strollers', 'Car seats', 'Toys', 'Maternity products'],
            'Sports, Fitness and Outdoor' => ['Gym equipment', 'Sports clothing', 'Sports shoes', 'Football equipment', 'Cycling', 'Camping', 'Hiking', 'Outdoor equipment'],
            'Automotive and Motorcycles' => ['Car accessories', 'Spare parts', 'Motorcycle accessories', 'Tyres', 'Wheels', 'Car electronics', 'Vehicle maintenance tools'],
            'Books, Stationery and Office' => ['Textbooks', 'Novels', 'Educational materials', 'Office supplies', 'Writing materials', 'Printers and accessories', 'Office furniture'],
            'Hardware, Tools and Construction' => ['Hand tools', 'Power tools', 'Building materials', 'Plumbing', 'Electrical equipment', 'Paint', 'Construction supplies', 'Safety equipment'],
            'Jewellery, Luxury and Gifts' => ['Jewellery', 'Watches', 'Gift sets', 'Luxury accessories', 'Personalised gifts', 'Collectibles'],
            'Pets and Pet Supplies' => ['Pet food', 'Toys', 'Beds', 'Grooming equipment', 'Pet accessories', 'Pet care products'],
            'Music, Art and Entertainment' => ['Musical instruments', 'Art materials', 'Craft products', 'Creative equipment', 'Musical accessories'],
            'Garden, Agriculture and Farming' => ['Seeds', 'Seedlings', 'Gardening equipment', 'Irrigation systems', 'Farm tools', 'Agricultural equipment', 'Animal feed', 'Outdoor plants'],
            'Travel and Luggage' => ['Suitcases', 'Travel bags', 'Backpacks', 'Travel accessories', 'Travel organisers'],
            'Renewable Energy and Solar Equipment' => ['Solar panels', 'Inverters', 'Batteries', 'Solar lighting', 'Solar accessories', 'Renewable-energy equipment'],
            'Health and Wellness Products' => ['Personal wellness equipment', 'Fitness and recovery accessories', 'Personal care equipment', 'Non-prescription health essentials', 'Health monitoring devices'],
            'Handmade, African and Artisan Products' => ['Handmade clothing', 'African crafts', 'Handmade jewellery', 'Artwork', 'Handmade furniture', 'Cultural accessories', 'Artisan products'],
        ];

        $restrictedSubcategories = ['Skincare', 'Cosmetics', 'Strollers', 'Car seats', 'Spare parts', 'Tyres', 'Electrical equipment', 'Paint', 'Pet food', 'Seeds', 'Animal feed', 'Inverters', 'Batteries', 'Non-prescription health essentials', 'Health monitoring devices'];

        $order = 1;
        foreach ($taxonomy as $categoryName => $subs) {
            $categoryId = DB::table('categories')->insertGetId([
                'name' => $categoryName,
                'slug' => Str::slug($categoryName),
                'is_active' => true,
                'sort_order' => $order++,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($subs as $subName) {
                $restricted = in_array($subName, $restrictedSubcategories, true);
                DB::table('subcategories')->insert([
                    'category_id' => $categoryId,
                    'name' => $subName,
                    'slug' => Str::slug($subName),
                    'is_restricted' => $restricted,
                    'restriction_requirements' => $restricted ? 'Requires compliance & safety verification during Stage-1 inspection.' : null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
