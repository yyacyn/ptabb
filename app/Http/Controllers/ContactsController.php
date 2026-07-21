<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactsController extends Controller
{
    /**
     * Display a listing of the contacts.
     *
     * Supports Inertia rendering for frontend and JSON responses for API testing.
     */
    public function index(Request $request)
    {
        $contacts = Contact::all();

        if ($request->wantsJson()) {
            return response()->json($contacts);
        }

        return Inertia::render('Contacts/Index', [
            'contacts' => $contacts,
        ]);
    }

    /**
     * Store a newly created contact in storage.
     *
     * Supports both standard web form submission and JSON API requests.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'subject' => 'required|string|max:255',
            'department' => 'nullable|string|max:100',
            'message' => 'required|string|max:2000',
            'ip_address' => 'nullable|string|max:45',
            'status' => 'nullable|string|in:pending,read,replied|max:50',
        ]);

        // Get IP address if not provided
        if (empty($validated['ip_address'])) {
            $validated['ip_address'] = $request->ip();
        }

        // Default status to 'pending' if not provided
        if (empty($validated['status'])) {
            $validated['status'] = 'pending';
        }

        // Create the contact
        $contact = Contact::create($validated);

        // Check if it's an API request
        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Contact message received successfully',
                'data' => $contact,
            ], 201);
        }

        // Return to Inertia page with success message
        return Inertia::location(route('contact.index'))->with('success', 'Thank you for your message! We will get back to you soon.');
    }

    /**
     * Display the specified contact.
     */
    public function show(string $id)
    {
        $contact = Contact::findOrFail($id);

        // Mark as read if it's a web request
        if (!request()->wantsJson()) {
            $contact->status = 'read';
            $contact->save();
        }

        if (request()->wantsJson()) {
            return response()->json($contact);
        }

        return Inertia::render('Contacts/Show', [
            'contact' => $contact,
        ]);
    }

    /**
     * Update the status of the specified contact (e.g., mark as replied).
     */
    public function update(Request $request, string $id)
    {
        $contact = Contact::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:pending,read,replied|max:50',
        ]);

        $contact->update($validated);

        return response()->json([
            'message' => 'Contact status updated successfully',
            'data' => $contact,
        ]);
    }

    /**
     * Remove the specified contact from storage.
     */
    public function destroy(string $id)
    {
        $contact = Contact::findOrFail($id);
        $contact->delete();

        return response()->json([
            'message' => 'Contact deleted successfully',
        ]);
    }

    /**
     * Get unread contacts count.
     */
    public function unreadCount()
    {
        $count = Contact::where('status', 'pending')->count();

        return response()->json([
            'count' => $count,
        ]);
    }
}