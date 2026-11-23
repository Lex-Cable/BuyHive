<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class KenyaLocationSeeder extends Seeder
{
    public function run(): void
    {
        $counties = [
            [1, 'Mombasa', 'Coast', ['Mombasa CBD', 'Nyali', 'Likoni'], true, 'BuyHive Mombasa Nyali Hub'],
            [2, 'Kwale', 'Coast', ['Ukunda', 'Diani', 'Kwale Town'], false, null],
            [3, 'Kilifi', 'Coast', ['Kilifi Town', 'Malindi', 'Mtwapa'], false, null],
            [4, 'Tana River', 'Coast', ['Hola', 'Garsen'], false, null],
            [5, 'Lamu', 'Coast', ['Lamu Town', 'Mpeketoni'], false, null],
            [6, 'Taita-Taveta', 'Coast', ['Voi', 'Taveta'], false, null],
            [7, 'Garissa', 'North Eastern', ['Garissa Town', 'Dadaab'], false, null],
            [8, 'Wajir', 'North Eastern', ['Wajir Town', 'Habaswein'], false, null],
            [9, 'Mandera', 'North Eastern', ['Mandera Town', 'Elwak'], false, null],
            [10, 'Marsabit', 'Eastern', ['Marsabit Town', 'Moyale'], false, null],
            [11, 'Isiolo', 'Eastern', ['Isiolo Town', 'Garbatulla'], false, null],
            [12, 'Meru', 'Eastern', ['Meru Town', 'Nkubu'], false, null],
            [13, 'Tharaka-Nithi', 'Eastern', ['Chuka', 'Kathwana'], false, null],
            [14, 'Embu', 'Eastern', ['Embu Town', 'Runyenjes'], false, null],
            [15, 'Kitui', 'Eastern', ['Kitui Town', 'Mwingi'], false, null],
            [16, 'Machakos', 'Eastern', ['Machakos Town', 'Athi River', 'Syokimau'], false, null],
            [17, 'Makueni', 'Eastern', ['Wote', 'Makindu'], false, null],
            [18, 'Nyandarua', 'Central', ['Ol Kalou', 'Engineer'], false, null],
            [19, 'Nyeri', 'Central', ['Nyeri Town', 'Karatina'], false, null],
            [20, 'Kirinyaga', 'Central', ['Kerugoya', 'Sagana'], false, null],
            [21, "Murang'a", 'Central', ["Murang'a Town", 'Kenol'], false, null],
            [22, 'Kiambu', 'Central', ['Thika', 'Ruiru', 'Kikuyu'], true, 'BuyHive Thika Road Hub'],
            [23, 'Turkana', 'Rift Valley', ['Lodwar', 'Kakuma'], false, null],
            [24, 'West Pokot', 'Rift Valley', ['Kapenguria', 'Makutano'], false, null],
            [25, 'Samburu', 'Rift Valley', ['Maralal', 'Baragoi'], false, null],
            [26, 'Trans-Nzoia', 'Rift Valley', ['Kitale', 'Kiminini'], false, null],
            [27, 'Uasin Gishu', 'Rift Valley', ['Eldoret', 'Turbo'], true, 'BuyHive Eldoret Zion Hub'],
            [28, 'Elgeyo-Marakwet', 'Rift Valley', ['Iten', 'Kapsowar'], false, null],
            [29, 'Nandi', 'Rift Valley', ['Kapsabet', 'Nandi Hills'], false, null],
            [30, 'Baringo', 'Rift Valley', ['Kabarnet', 'Eldama Ravine'], false, null],
            [31, 'Laikipia', 'Rift Valley', ['Nanyuki', 'Nyahururu'], false, null],
            [32, 'Nakuru', 'Rift Valley', ['Nakuru City', 'Naivasha'], true, 'BuyHive Nakuru CBD Hub'],
            [33, 'Narok', 'Rift Valley', ['Narok Town', 'Kilgoris'], false, null],
            [34, 'Kajiado', 'Rift Valley', ['Kitengela', 'Ongata Rongai', 'Ngong'], false, null],
            [35, 'Kericho', 'Rift Valley', ['Kericho Town', 'Litein'], false, null],
            [36, 'Bomet', 'Rift Valley', ['Bomet Town', 'Sotik'], false, null],
            [37, 'Kakamega', 'Western', ['Kakamega Town', 'Mumias'], false, null],
            [38, 'Vihiga', 'Western', ['Mbale', 'Luanda'], false, null],
            [39, 'Bungoma', 'Western', ['Bungoma Town', 'Webuye'], false, null],
            [40, 'Busia', 'Western', ['Busia Town', 'Malaba'], false, null],
            [41, 'Siaya', 'Nyanza', ['Siaya Town', 'Bondo'], false, null],
            [42, 'Kisumu', 'Nyanza', ['Kisumu City', 'Ahero'], true, 'BuyHive Kisumu Mega Hub'],
            [43, 'Homa Bay', 'Nyanza', ['Homa Bay Town', 'Mbita'], false, null],
            [44, 'Migori', 'Nyanza', ['Migori Town', 'Rongo'], false, null],
            [45, 'Kisii', 'Nyanza', ['Kisii Town', 'Ogembo'], false, null],
            [46, 'Nyamira', 'Nyanza', ['Nyamira Town', 'Keroka'], false, null],
            [47, 'Nairobi', 'Nairobi', ['Westlands', 'Kilimani', 'CBD', 'Karen'], true, 'BuyHive Nairobi Westlands Flagship Hub'],
        ];

        foreach ($counties as [$code, $name, $region, $towns, $hasHub, $hubName]) {
            DB::table('locations')->insert([
                'country' => 'Kenya',
                'county_code' => $code,
                'county_name' => $name,
                'slug' => Str::slug($name),
                'region' => $region,
                'major_towns' => json_encode($towns),
                'has_collection_hub' => $hasHub,
                'collection_hub_name' => $hubName,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
