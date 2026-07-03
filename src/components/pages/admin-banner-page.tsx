'use client';

import { useState } from 'react';
import { useAuth } from '@/store/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  ImageIcon,
  CloudUpload, Lightbulb, ChevronRight, Calendar, Eye, Globe,
  Loader2
} from 'lucide-react';

export function AdminBannerPage() {
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [visibility, setVisibility] = useState('public');
  const [saving, setSaving] = useState(false);

  const inputClass = 'w-full rounded-xl border border-rl-outline-variant bg-rl-surface-container-lowest px-4 py-3 text-sm text-rl-on-surface placeholder:text-rl-on-surface-variant focus:border-rl-primary focus:ring-2 focus:ring-rl-primary/20 outline-none transition-all';

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: 'Validation Error', description: 'Banner title is required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const headers = {
        ...useAuth.getState().getAuthHeaders(),
        'Content-Type': 'application/json',
      };

      const body: Record<string, unknown> = {
        title: title.trim(),
        link: link.trim() || null,
        isActive,
        isPublic: visibility === 'public',
      };

      if (startDate) body.startDate = startDate;
      if (endDate) body.endDate = endDate;

      const res = await fetch('/api/banners', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create banner');
      }

      toast({ title: 'Success', description: 'Banner created successfully!' });
      setTitle('');
      setLink('');
      setStartDate('');
      setEndDate('');
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save banner',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <nav className="flex items-center gap-1 text-xs text-rl-on-surface-variant mb-6">
        <span>Banner Management</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-rl-on-surface font-medium">Add New Banner</span>
      </nav>

      <h1 className="text-xl sm:text-2xl font-bold text-rl-on-surface mb-6">Add New Banner</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="bg-rl-surface-container-lowest rounded-2xl border border-rl-outline-variant/50 p-6">
            <h2 className="text-base font-semibold text-rl-on-surface mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-rl-primary" />
              Banner Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-rl-on-surface mb-1.5 block">Banner Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Summer Collection Sale" className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-rl-on-surface mb-1.5 block">Banner Link</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rl-on-surface-variant" />
                  <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://example.com/collection" className={`${inputClass} pl-10`} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-rl-on-surface mb-1.5 block">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rl-on-surface-variant" />
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`${inputClass} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-rl-on-surface mb-1.5 block">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rl-on-surface-variant" />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={`${inputClass} pl-10`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-rl-surface-container-lowest rounded-2xl border border-rl-outline-variant/50 p-6">
            <h2 className="text-base font-semibold text-rl-on-surface mb-4 flex items-center gap-2">
              <CloudUpload className="w-5 h-5 text-rl-primary" />
              Banner Media
            </h2>
            <div className="border-2 border-dashed border-rl-outline-variant rounded-2xl p-8 text-center hover:border-rl-primary/50 transition-colors cursor-pointer">
              <div className="w-14 h-14 bg-rl-primary-container rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CloudUpload className="w-7 h-7 text-rl-primary" />
              </div>
              <p className="text-sm font-medium text-rl-on-surface mb-1">
                Drag &amp; drop your image here
              </p>
              <p className="text-xs text-rl-on-surface-variant mb-3">
                or click to browse · PNG, JPG up to 5MB
              </p>
              <button onClick={() => toast({ title: 'Browse Files', description: 'File picker coming soon!' })} className="bg-rl-surface-container-high text-rl-on-surface px-4 py-2 rounded-full text-xs font-semibold hover:bg-rl-surface-container-highest transition-colors">
                Browse Files
              </button>
            </div>

            <div className="mt-4 bg-rl-tertiary-container rounded-xl p-4 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-rl-on-tertiary-container mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-rl-on-tertiary-container">Design Tip</p>
                <p className="text-xs text-rl-on-tertiary-container/80 mt-1">
                  For best results, use images with a 16:9 aspect ratio. Recommended resolution: 1920x1080px.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-rl-surface-container-lowest rounded-2xl border border-rl-outline-variant/50 p-6 lg:sticky lg:top-24">
            <h2 className="text-base font-semibold text-rl-on-surface mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-rl-primary" />
              Publishing Status
            </h2>

            <div className="space-y-5">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-rl-outline-variant peer-focus:ring-2 peer-focus:ring-rl-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rl-primary"></div>
                  </div>
                  <span className="text-sm font-medium text-rl-on-surface">Active Now</span>
                </div>
              </label>

              <div>
                <p className="text-sm font-medium text-rl-on-surface mb-3">Visibility</p>
                <div className="space-y-2">
                  {[
                    { key: 'public', label: 'Public', desc: 'Visible to everyone', icon: Globe },
                    { key: 'private', label: 'Private', desc: 'Only admins can see', icon: Eye },
                  ].map((option) => (
                    <label
                      key={option.key}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        visibility === option.key
                          ? 'border-rl-primary bg-rl-primary-container/30'
                          : 'border-rl-outline-variant/50 hover:bg-rl-surface-container-low'
                      }`}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={option.key}
                        checked={visibility === option.key}
                        onChange={() => setVisibility(option.key)}
                        className="sr-only"
                      />
                      <option.icon className={`w-4 h-4 ${visibility === option.key ? 'text-rl-primary' : 'text-rl-on-surface-variant'}`} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${visibility === option.key ? 'text-rl-on-surface' : 'text-rl-on-surface-variant'}`}>{option.label}</p>
                        <p className="text-xs text-rl-on-surface-variant">{option.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        visibility === option.key ? 'border-rl-primary' : 'border-rl-outline-variant'
                      }`}>
                        {visibility === option.key && <div className="w-2.5 h-2.5 bg-rl-primary rounded-full" />}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-rl-outline-variant/50">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-rl-primary text-rl-on-primary py-3 rounded-full text-sm font-semibold shadow-md hover:bg-rl-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}