<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $branches = [
            [
                'slug' => 'pontianak',
                'name' => 'Pontianak, West Kalimantan',
                'type' => 'Branch Office',
                'company_name' => 'PT. Pelayaran Andalas Bahtera Baruna Pontianak',
                'short_desc' => 'Branch Office Indonesia',
                'address' => 'Pontianak Port Area, West Kalimantan, Indonesia',
                'phone' => '+62 561 000000',
                'email' => 'pontianak@ptabb.co.id',
                'map_url' => null,
                'image_url' => 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'slug' => 'tuban',
                'name' => 'Tuban, East Java',
                'type' => 'Branch Office',
                'company_name' => 'PT. Pelayaran Andalas Bahtera Baruna Tuban',
                'short_desc' => 'Branch Office Indonesia',
                'address' => 'Tuban Industrial Port Complex, East Java, Indonesia',
                'phone' => '+62 356 000000',
                'email' => 'tuban@ptabb.co.id',
                'map_url' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.7026954380094!2d111.9392790113708!3d-6.805974293163146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e77a787f7ac8185%3A0xa63f277caab38294!2sPT.%20PELAYARAN%20ANDALAS%20BAHTERA%20BARUNA!5e0!3m2!1sen!2sid!4v1785750531242!5m2!1sen!2sid',
                'image_url' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'slug' => 'padang',
                'name' => 'Padang, West Sumatra',
                'type' => 'Branch Office',
                'company_name' => 'PT. Pelayaran Andalas Bahtera Baruna Padang',
                'short_desc' => 'Branch Office Indonesia',
                'address' => 'Teluk Bayur Port Corridor, Padang, West Sumatra, Indonesia',
                'phone' => '+62 751 000000',
                'email' => 'padang@ptabb.co.id',
                'map_url' => null,
                'image_url' => 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'slug' => 'banyuwangi',
                'name' => 'Banyuwangi, East Java',
                'type' => 'Branch Office',
                'company_name' => 'PT. Pelayaran Andalas Bahtera Baruna Banyuwangi',
                'short_desc' => 'Branch Office Indonesia',
                'address' => 'Tanjung Wangi Port Zone, Banyuwangi, East Java, Indonesia',
                'phone' => '+62 333 000000',
                'email' => 'banyuwangi@ptabb.co.id',
                'map_url' => null,
                'image_url' => 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'slug' => 'singapore',
                'name' => 'Singapore',
                'type' => 'Representative Office',
                'company_name' => 'Duta Buana Marine & Machinery Pte. Ltd.',
                'short_desc' => 'Representative Office',
                'address' => 'Regional Representative Office, Singapore',
                'phone' => '+65 6000 0000',
                'email' => 'singapore@ptabb.co.id',
                'map_url' => null,
                'image_url' => 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80',
                'sort_order' => 5,
                'is_active' => true,
            ],
            [
                'slug' => 'batam',
                'name' => 'Batam, Riau Islands',
                'type' => 'Shipyard',
                'company_name' => 'PT. Sumber Marine Shipyard',
                'short_desc' => 'Vessel Building & Repair Facility',
                'address' => 'Tanjung Uncang Industrial Shipyard Zone, Batam, Riau Islands',
                'phone' => '+62 778 000000',
                'email' => 'batam.shipyard@ptabb.co.id',
                'map_url' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.1334440620126!2d103.91407751134618!3d1.0616303989236995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d9f2d3684f3d7f%3A0x57c21d1c7f3fa731!2sPT.%20Sumber%20Marine%20Shipyard!5e0!3m2!1sen!2sid!4v1785750320902!5m2!1sen!2sid',
                'image_url' => 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80',
                'sort_order' => 6,
                'is_active' => true,
            ],
        ];

        foreach ($branches as $branch) {
            Branch::updateOrCreate(
                ['slug' => $branch['slug']],
                $branch
            );
        }
    }
}

    /**
     * Run the database seeds.
     */
