<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ContactInfo;

class ContactInfosController extends Controller
{
    public function index(Request $request)
    {
        $contact_infos = ContactInfo::all();

        if ($request->wantsJson()) {
            return response()->json($contact_infos);
        }

        return Inertia::render('ContactInfos', [
            'contact_infos' => $contact_infos,
        ]);
    }
}