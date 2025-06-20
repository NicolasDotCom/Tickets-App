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
