<?php

namespace App\Http\Controllers;

use App\Models\Career;
use App\Models\Client;
use App\Models\Contact;
use App\Models\Fleet;
use App\Models\News;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $userRole = $user ? $user->role : 'super_admin';

        // 1. Filter Unread Messages based on RBAC & BR-04 (HRD-routed messages hidden from Crew/PR admin)
        $contactsQuery = Contact::query();
        if (in_array($userRole, ['crew_admin', 'pr_admin'])) {
            $contactsQuery->where(function ($q) {
                $q->whereNull('department')
                  ->orWhere('department', '!=', 'hrd');
            });
        }

        $unreadQuery = (clone $contactsQuery)->where(function ($q) {
            $q->where('status', 'unread')->orWhereNull('status');
        });

        $unreadMessages = $unreadQuery->get();
        $unreadCount = $unreadMessages->count();
        $olderUnreadCount = $unreadMessages->filter(function ($c) {
            return $c->created_at && $c->created_at->lt(now()->subHours(48));
        })->count();

        // 2. Filter Careers based on RBAC (hr_admin -> corporate, crew_admin -> crew, pr_admin -> not allowed/0)
        $careersQuery = Career::query();
        if ($userRole === 'hr_admin') {
            $careersQuery->where('category', 'corporate');
        } elseif ($userRole === 'crew_admin') {
            $careersQuery->where('category', 'crew');
        } elseif ($userRole === 'pr_admin') {
            $careersQuery->whereRaw('1 = 0');
        }

        $careersCount = (clone $careersQuery)->count();
        $openCareersCount = (clone $careersQuery)->where('status', 'open')->count();

        // 3. Filter News (PR Admin & Super Admin primary)
        $newsQuery = News::query();
        $newsCount = $newsQuery->count();
        $draftNewsCount = (clone $newsQuery)->where('status', 'draft')->count();

        // 4. Notifications & Banners (Super Admin & HR Admin)
        $activeBannersCount = Notification::where('status', 'active')->count();

        // 5. Dynamic activity stream compiled from DB records according to user role permissions
        $activities = collect();

        // Contacts Activity (HRD messages filtered for Crew/PR admin)
        (clone $contactsQuery)->latest()->take(3)->get()->each(function ($contact) use (&$activities) {
            $activities->push([
                'id' => 'contact-' . $contact->id,
                'color' => 'rose',
                'title' => 'New contact message from ' . ($contact->company ?: $contact->name) . ' — ' . ($contact->subject ?: 'Inquiry'),
                'time' => $contact->created_at ? $contact->created_at->diffForHumans() : 'Recently',
                'department' => $contact->department ?: 'Customer Support',
                'timestamp' => $contact->created_at ? $contact->created_at->timestamp : 0,
            ]);
        });

        // News Activity (Visible to Super Admin & PR Admin)
        if (in_array($userRole, ['super_admin', 'pr_admin'])) {
            News::latest()->take(3)->get()->each(function ($article) use (&$activities) {
                $activities->push([
                    'id' => 'news-' . $article->id,
                    'color' => 'emerald',
                    'title' => 'Article "' . $article->title . '" ' . ($article->status === 'draft' ? 'drafted' : 'published'),
                    'time' => $article->created_at ? $article->created_at->diffForHumans() : 'Recently',
                    'department' => 'Public Relations',
                    'timestamp' => $article->created_at ? $article->created_at->timestamp : 0,
                ]);
            });

            Client::latest()->take(2)->get()->each(function ($client) use (&$activities) {
                $activities->push([
                    'id' => 'client-' . $client->id,
                    'color' => 'emerald',
                    'title' => 'New client partner ' . $client->name . ' added',
                    'time' => $client->created_at ? $client->created_at->diffForHumans() : 'Recently',
                    'department' => 'Public Relations',
                    'timestamp' => $client->created_at ? $client->created_at->timestamp : 0,
                ]);
            });
        }

        // Career Activity (Visible to Super Admin, HR Admin, Crew Admin)
        if (in_array($userRole, ['super_admin', 'hr_admin', 'crew_admin'])) {
            (clone $careersQuery)->latest()->take(3)->get()->each(function ($career) use (&$activities) {
                $activities->push([
                    'id' => 'career-' . $career->id,
                    'color' => 'sky',
                    'title' => 'Job opening posted for ' . $career->position . ' (' . ucfirst($career->category ?: 'corporate') . ')',
                    'time' => $career->created_at ? $career->created_at->diffForHumans() : 'Recently',
                    'department' => $career->department ?: 'Human Resources',
                    'timestamp' => $career->created_at ? $career->created_at->timestamp : 0,
                ]);
            });
        }

        $recentActivities = $activities->sortByDesc('timestamp')->values()->take(6);

        return Inertia::render('Dashboard/Index', [
            'fleetsCount' => Fleet::count(),
            'newsCount' => $newsCount,
            'clientsCount' => Client::count(),
            'careersCount' => $careersCount,
            'notificationsCount' => Notification::count(),
            'unreadMessagesCount' => $unreadCount,
            'olderUnreadCount' => $olderUnreadCount,
            'applicationsCount' => $openCareersCount,
            'draftsCount' => $draftNewsCount,
            'activeBannersCount' => $activeBannersCount,
            'recentActivities' => $recentActivities,
        ]);
    }
}
