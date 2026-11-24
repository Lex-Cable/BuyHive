<?php
namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
/** @extends Factory<\App\Models\User> */
class UserFactory extends Factory {
 protected static ?string $password = null;
 public function definition(): array { return ['name'=>fake()->name(),'email'=>fake()->unique()->safeEmail(),'phone'=>fake()->optional()->e164PhoneNumber(),'email_verified_at'=>now(),'password'=>static::$password ??= Hash::make('Password123'),'primary_role'=>'customer','remember_token'=>Str::random(10)]; }
 public function seller(): static { return $this->state(fn()=>['primary_role'=>'seller']); }
 public function unverified(): static { return $this->state(fn()=>['email_verified_at'=>null]); }
}
