<?php

namespace App\Http\Controllers;

use App\Models\ContactInfo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactInfosController extends Controller
{
    public function index(Request $request)
    {
        $contact_infos = ContactInfo::orderBy('display_order', 'asc')->get();

        if ($request->wantsJson()) {
            return response()->json($contact_infos);
        }

        if (!auth()->check()) {
            return redirect()->route('login');
        }

        if ($request->user()->role !== 'super_admin') {
            abort(403, 'Only Super Admin can manage HQ contact information.');
        }

        return Inertia::render('Dashboard/ContactInfos', [
            'contactInfos' => $contact_infos,
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'super_admin') {
            abort(403, 'Only Super Admin can add HQ contact information.');
        }

        $validated = $request->validate([
            'label' => 'required|string|max:100',
            'type' => 'required|string|in:office,phone,email,social',
            'value' => 'required|string|max:255',
            'icon' => 'nullable|string|max:50',
            'is_primary' => 'boolean',
            'display_order' => 'integer',
        ]);

        ContactInfo::create($validated);

        return redirect()->back()->with('success', 'Contact information added successfully.');
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            abort(403, 'Only Super Admin can update HQ contact information.');
        }

        $contactInfo = ContactInfo::findOrFail($id);

        $validated = $request->validate([
            'label' => 'required|string|max:100',
            'type' => 'required|string|in:office,phone,email,social',
            'value' => 'required|string|max:255',
            'icon' => 'nullable|string|max:50',
            'is_primary' => 'boolean',
            'display_order' => 'integer',
        ]);

        $contactInfo->update($validated);

        return redirect()->back()->with('success', 'Contact information updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            abort(403, 'Only Super Admin can delete HQ contact information.');
        }

        $contactInfo = ContactInfo::findOrFail($id);
        $contactInfo->delete();

        return redirect()->back()->with('success', 'Contact information deleted successfully.');
    }
}