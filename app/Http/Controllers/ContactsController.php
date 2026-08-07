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
            if ($user->role === 'hr_admin') {
                $query->where('department', 'hrd');
            } elseif ($user->role === 'crew_admin') {
                $query->where('department', 'crew');
            } elseif ($user->role === 'pr_admin') {
                // BR-04: HRD and Crew contact messages hidden from PR admin at query level
                $query->where(function ($q) {
                    $q->whereNull('department')
                      ->orWhereNotIn('department', ['hrd', 'crew']);
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
        $branches = \App\Models\Branch::where('is_active', true)->orderBy('sort_order', 'asc')->get();

        if ($request->wantsJson()) {
            return response()->json([
                'contactInfos' => $contactInfos,
                'branches' => $branches,
            ]);
        }

        return Inertia::render('Contacts', [
            'contactInfos' => $contactInfos,
            'branches' => $branches,
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
            'department' => 'nullable|string|in:commercial,operation,hrd,crew,general',
            'message' => 'required|string|max:2000',
            'resume' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'ip_address' => 'nullable|string|max:45',
            'status' => 'nullable|string|in:new,read,replied',
        ]);

        if ($request->hasFile('resume')) {
            $path = $request->file('resume')->store('resumes', 'public');
            $validated['resume_path'] = '/storage/' . $path;
        }

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
     * Serve the resume/CV file inline so the browser previews it instead of downloading.
     */
    public function previewResume(string $id)
    {
        $contact = Contact::findOrFail($id);

        abort_if(!$contact->resume_path, 404, 'No resume attached.');

        // Convert stored path (/storage/resumes/xxx.pdf) → absolute disk path
        $relativePath = str_replace('/storage/', '', $contact->resume_path);
        $absolutePath = storage_path('app/public/' . $relativePath);

        abort_if(!file_exists($absolutePath), 404, 'Resume file not found.');

        $mimeType = mime_content_type($absolutePath) ?: 'application/octet-stream';
        $filename  = basename($absolutePath);

        return response()->file($absolutePath, [
            'Content-Type'        => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);
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