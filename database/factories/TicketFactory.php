<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Support;
use App\Models\Ticket;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ticket>
 */
class TicketFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Ticket::class;

    public function definition(): array
    {
        $categories = ['computador', 'laptop', 'impresora', 'escaner', 'multifuncional', 'monitor', 'teclado', 'mouse', 'telefono', 'tablet'];
        
        return [
            'customer_id' => Customer::query()->exists()
                ? Customer::query()->inRandomOrder()->first()->id
                : Customer::factory(),
            'support_id' => Support::query()->exists()
                ? Support::query()->inRandomOrder()->first()->id
                : Support::factory(),
            'attachment' => null, // No generamos archivos falsos
            'equipment_category' => $this->faker->randomElement($categories),
            'equipment_name' => $this->faker->words(3, true),
            'equipment_serial' => $this->faker->bothify('???###***'),
            'equipment_area' => $this->faker->randomElement(['Contabilidad', 'Recursos Humanos', 'Ventas', 'IT', 'Gerencia', 'Recepción']),
            'description' => $this->faker->paragraph,
            'status' => $this->faker->randomElement(['Open', 'In Progress', 'Closed']),
        ];
    }
}
