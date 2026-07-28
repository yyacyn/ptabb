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
    public function index()
    {
        $unreadMessages = Contact::where('status', 'unread')->orWhereNull('status')->get();
        $unreadCount = Contact::where('status', 'unread')->orWhereNull('status')->count();
        $olderUnreadCount = $unreadMessages->filter(function ($c) {
            return $c->created_at && $c->created_at->lt(now()->subHours(48));
        })->count();

        $activeBannersCount = Notification::where('status', 'active')->count();
        $openCareersCount = Career::where('status', 'open')->count();
        $draftNewsCount = News::where('status', 'draft')->count();

        // Dynamic activity stream compiled from DB records
        $activities = collect();

        Contact::latest()->take(3)->get()->each(function ($contact) use (&$activities) {
            $activities->push([
                'id' => 'contact-' . $contact->id,
                'color' => 'rose',
                'title' => 'New contact message from ' . ($contact->company ?: $contact->name) . ' — ' . ($contact->subject ?: 'Inquiry'),
                'time' => $contact->created_at ? $contact->created_at->diffForHumans() : 'Recently',
                'department' => $contact->department ?: 'Customer Support',
                'timestamp' => $contact->created_at ? $contact->created_at->timestamp : 0,
            ]);
        });

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

        Career::latest()->take(3)->get()->each(function ($career) use (&$activities) {
            $activities->push([
                'id' => 'career-' . $career->id,
                'color' => 'sky',
                'title' => 'Job opening posted for ' . $career->position . ' (' . ucfirst($career->category ?: 'Darat') . ')',
                'time' => $career->created_at ? $career->created_at->diffForHumans() : 'Recently',
                'department' => $career->department ?: 'Human Resources',
                'timestamp' => $career->created_at ? $career->created_at->timestamp : 0,
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

        $recentActivities = $activities->sortByDesc('timestamp')->values()->take(6);

        return Inertia::render('Dashboard/Index', [
            'fleetsCount' => Fleet::count(),
            'newsCount' => News::count(),
            'clientsCount' => Client::count(),
            'careersCount' => Career::count(),
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
