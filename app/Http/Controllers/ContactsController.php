<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactsController extends Controller
{
    /**
     * Display a listing of the contact messages.
     */
    public function index(Request $request)
    {
        $query = Contact::query();

        if (auth()->check()) {
            $user = auth()->user();
            // BR-04: HRD-routed contact messages filtered out from Crew/PR admins at query level
            if (in_array($user->role, ['crew_admin', 'pr_admin'])) {
                $query->where(function($q) {
                    $q->whereNull('department')
                      ->orWhere('department', '!=', 'hrd');
                });
            }
        }

        $contacts = $query->latest()->get();

        if ($request->wantsJson()) {
            return response()->json($contacts);
        }

        return Inertia::render('Dashboard/Contacts', [
            'contacts' => $contacts,
        ]);
    }

    /**
     * Display the public contact page.
     */
    public function publicIndex(Request $request)
    {
        $contactInfos = \App\Models\ContactInfo::orderBy('display_order', 'asc')->get();

        if ($request->wantsJson()) {
            return response()->json([
                'contactInfos' => $contactInfos,
            ]);
        }

        return Inertia::render('Contacts', [
            'contactInfos' => $contactInfos,
        ]);
    }

    /**
     * Store a newly created contact message from public form.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'subject' => 'required|string|max:255',
            'department' => 'nullable|string|in:commercial,operation,hrd,general',
            'message' => 'required|string|max:2000',
            'ip_address' => 'nullable|string|max:45',
            'status' => 'nullable|string|in:new,read,replied',
        ]);

        if (empty($validated['ip_address'])) {
            $validated['ip_address'] = $request->ip();
        }

        if (empty($validated['status'])) {
            $validated['status'] = 'new';
        }

        $contact = Contact::create($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Contact message received successfully',
                'data' => $contact,
            ], 201);
        }

        return redirect()->back()->with('success', 'Thank you for your message! We will get back to you soon.');
    }

    /**
     * Display the specified contact.
     */
    public function show(string $id)
    {
        $contact = Contact::findOrFail($id);

        if ($contact->status === 'new') {
            $contact->status = 'read';
            $contact->save();
        }

        if (request()->wantsJson()) {
            return response()->json($contact);
        }

        return response()->json($contact);
    }

    /**
     * Update the status of the specified contact (e.g., mark as read or replied).
     */
    public function update(Request $request, string $id)
    {
        $contact = Contact::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:new,read,replied',
        ]);

        $contact->update($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Contact status updated successfully',
                'data' => $contact,
            ]);
        }

        return redirect()->back()->with('success', 'Message status updated.');
    }

    /**
     * Remove the specified contact from storage.
     */
    public function destroy(string $id)
    {
        $contact = Contact::findOrFail($id);
        $contact->delete();

        if (request()->wantsJson()) {
            return response()->json([
                'message' => 'Contact deleted successfully',
            ]);
        }

        return redirect()->back()->with('success', 'Contact message deleted successfully.');
    }
}