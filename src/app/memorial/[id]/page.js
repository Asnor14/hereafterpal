'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import MemorialNav from '@/components/memorial/MemorialNav';
import MemorialHero from '@/components/memorial/MemorialHero';
import Timeline from '@/components/memorial/Timeline';
import MemoryLane from '@/components/memorial/MemoryLane';


import Guestbook from '@/components/memorial/Guestbook';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

export default function MemorialProfilePage() {
  const params = useParams();
  const memorialId = params?.id;
  const supabase = createClientComponentClient();

  const [memorial, setMemorial] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');

  // Fetch memorial data
  useEffect(() => {
    if (!memorialId) return;

    const fetchMemorial = async () => {
      try {
        const { data, error } = await supabase
          .from('memorials')
          .select('*')
          .eq('id', memorialId)
          .single();

        if (error) throw error;
        setMemorial(data);
      } catch (error) {
        console.error('Error fetching memorial:', error);
        toast.error('Failed to load memorial');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemorial();
  }, [memorialId, supabase]);

  // Fetch guestbook messages
  useEffect(() => {
    if (!memorialId) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('guestbook_entries')
          .select('*')
          .eq('memorial_id', memorialId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [memorialId, supabase]);

  // Fetch gallery photos
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  useEffect(() => {
    if (!memorialId) return;

    const fetchPhotos = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery_photos')
          .select('*')
          .eq('memorial_id', memorialId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGalleryPhotos(data || []);
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };

    fetchPhotos();
  }, [memorialId, supabase]);

  // Handle guestbook submission
  const handleGuestbookSubmit = async (formData) => {
    try {
      const { error } = await supabase
        .from('guestbook_entries')
        .insert([
          {
            memorial_id: memorialId,
            author_name: formData.name,
            message: formData.message,
            role: formData.role || 'Stranger',
          },
        ]);

      if (error) throw error;

      // Refresh messages
      const { data: newMessages } = await supabase
        .from('guestbook_entries')
        .select('*')
        .eq('memorial_id', memorialId)
        .order('created_at', { ascending: false });

      setMessages(newMessages || []);
      toast.success('Thank you for sharing your memory', {
        icon: '💙',
        style: {
          background: '#FAF9F7',
          color: '#2C2C2C',
          padding: '16px',
          borderRadius: '8px',
        },
      });
    } catch (error) {
      console.error('Error submitting message:', error);
      toast.error('Failed to submit message. Please try again.');
      throw error;
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'life-story', 'photos', 'guestbook'];
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-memorial-bg dark:bg-memorialDark-bg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-memorial-accent/30 border-t-memorial-accent dark:border-memorialDark-accent/30 dark:border-t-memorialDark-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary">
            Loading memorial...
          </p>
        </div>
      </div>
    );
  }

  if (!memorial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-memorial-bg dark:bg-memorialDark-bg px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl md:text-3xl font-serif text-memorial-text dark:text-memorialDark-text mb-4">
            Memorial Not Found
          </h1>
          <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-8">
            We couldn't find the memorial you're looking for. It may have been removed or the link may be incorrect.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-memorial-accent dark:bg-memorialDark-accent text-white rounded-memorial hover:opacity-90 transition-opacity duration-200"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  // Generate dynamic milestones based on actual memorial dates
  const generateMilestones = () => {
    const milestones = [];

    // Birth milestone
    if (memorial.date_of_birth) {
      const birthDate = new Date(memorial.date_of_birth);
      milestones.push({
        id: 'birth',
        date: memorial.date_of_birth,
        title: 'Born',
        description: `${memorial.name} was born on ${birthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`,
      });
    }

    // Passing milestone
    if (memorial.date_of_passing) {
      const passingDate = new Date(memorial.date_of_passing);
      const age = memorial.date_of_birth
        ? Math.floor((passingDate - new Date(memorial.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000))
        : null;

      milestones.push({
        id: 'passing',
        date: memorial.date_of_passing,
        title: 'Passed Away',
        description: age
          ? `${memorial.name} passed away at the age of ${age}, leaving behind cherished memories.`
          : `${memorial.name} passed away, leaving behind cherished memories.`,
      });
    }

    return milestones;
  };

  const milestones = generateMilestones();

  return (
    <div className="min-h-screen bg-memorial-bg dark:bg-memorialDark-bg pb-20 md:pb-8">
      {/* Navigation */}
      <MemorialNav memorialId={memorialId} activeSection={activeSection} />

      {/* Hero Section - Pass actual memorial data */}
      <section id="home" className="scroll-mt-20">
        <MemorialHero memorial={memorial} />
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Life Story / Timeline Section */}
        {milestones && milestones.length > 0 && (
          <section id="life-story" className="py-12 md:py-16 scroll-mt-20">
            <h2 className="text-3xl md:text-4xl font-serif text-memorial-text dark:text-memorialDark-text mb-8 md:mb-12 text-center">
              Life Story
            </h2>
            <div className="max-w-4xl mx-auto">
              <Timeline milestones={milestones} />
            </div>
          </section>
        )}

        {/* Divider */}
        <div className="border-t border-memorial-divider dark:border-memorialDark-divider my-12 md:my-16" />

        {/* Memory Lane Section */}
        {galleryPhotos && galleryPhotos.length > 0 && (
          <section id="photos" className="scroll-mt-20 -mx-4 md:-mx-6 lg:mx-0">
            <MemoryLane photos={galleryPhotos} memorialName={memorial.name} />
          </section>
        )}

        {/* Guestbook Section */}
        <section id="guestbook" className="py-12 md:py-16 scroll-mt-20">
          <h2 className="text-3xl md:text-4xl font-serif text-memorial-text dark:text-memorialDark-text mb-8 md:mb-12 text-center">
            Book of Memories
          </h2>
          <div className="max-w-4xl mx-auto">
            <Guestbook
              messages={messages}
              onSubmit={handleGuestbookSubmit}
              isLoading={false}
            />
          </div>
        </section>
      </div>

      {/* Footer Note */}
      <footer className="mt-16 py-8 text-center text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary border-t border-memorial-divider dark:border-memorialDark-divider no-print">
        <p className="max-w-2xl mx-auto px-4">
          This memorial page is a place to celebrate, remember, and honor a life well lived.
          <br />
          Created with love by HereAfter, Pal
        </p>
      </footer>
    </div>
  );
}
