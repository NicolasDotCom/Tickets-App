<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'customer_id',
        'support_id',
        'subject',
        'description',
        'phone',
        'address',
        'brand',
        'model',
        'serial',
        'status',
        'closed_at',
    ];

    protected $casts = [
        'closed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The attributes that should be mutated to dates.
     */
    protected $dates = [
        'created_at',
        'updated_at',
        'closed_at',
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

    //Relación con TicketDocument
    public function documents()
    {
        return $this->hasMany(TicketDocument::class);
    }

    //Relación con TicketComment
    public function comments()
    {
        return $this->hasMany(TicketComment::class);
    }

    //Relación con User (creador del ticket)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
