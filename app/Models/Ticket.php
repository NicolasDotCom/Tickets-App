<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'support_id',
        'attachment',
        'equipment_category',
        'equipment_name',
        'equipment_serial',
        'equipment_area',
        'description',
        'status',
    ];

    //Relación con Customer
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    //Relación con Support
    public function support()
    {
        return $this->belongsTo(Support::class, 'support_id');
    }
}
