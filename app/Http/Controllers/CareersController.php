<?php

namespace App\Http\Controllers;

use App\Models\Careers;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CareersController extends Controller
{
    public function index(Request $request)
    {
        $careers = Careers::all();

        if ($request->wantsJson()) {
            return response()->json($careers);
        }

        return Inertia::render('Careers', [
            'careers' => $careers,
        ]);
    }


    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            'name' => 'required',
            'email' => 'required|email',
            'phone' => 'required',
            'resume' => 'required|file|mimes:pdf,doc,docx|max:10240',
            'position' => 'required',
        ]);

        // Handle file upload
        $resumePath = null;
        if ($request->hasFile('resume')) {
            $resumePath = $request->file('resume')->store('resumes', 'public');
        }

        // Store the data in the database
        $application = new Application();
        $application->name = $request->name;
        $application->email = $request->email;
        $application->phone = $request->phone;
        $application->resume_path = $resumePath;
        $application->position = $request->position;
        $application->save();

        // Send notification email to admin
        Mail::to(config('mail.from.address'))->send(new ApplicationReceived($application));

        return redirect()->route('careers.index')->with('success', 'Thank you for your application! We will get back to you soon.');
    }
}
