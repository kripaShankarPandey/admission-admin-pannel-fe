"use client";

import { useEffect, useState } from "react";
import { Save, Plus, Trash2, Globe, Sparkles, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { homePageService, type HomePageSettings } from "@/services/home-page-service";

interface TopicLink {
  label: string;
  href: string;
}

interface TopicSection {
  heading: string;
  links: TopicLink[];
}

interface CityItem {
  city: string;
  href: string;
}

interface QuickLinkItem {
  label: string;
  href: string;
}

interface ExamLinkItem {
  label: string;
  href: string;
}

interface SeoContentForm {
  title: string;
  introParagraph1: string;
  introParagraph2: string;
  disclaimer: string;
  topics: TopicSection[];
  cities: CityItem[];
  directoryTitle: string;
  directorySubtitle: string;
  quickLinks: QuickLinkItem[];
  examLinks: ExamLinkItem[];
}

const defaultSeoContent: SeoContentForm = {
  title: "India's Trusted College Admission Counselling Platform — NEET, JEE, CAT, CLAT 2026",
  introParagraph1: "AdmissionToday connects students with India's top colleges across medical, engineering, law, management, and arts streams. Our certified counsellors provide free, personalised guidance for NEET 2026 counselling, JEE Advanced college selection, CAT-based MBA admissions, and CLAT law college admissions — covering both merit and management quota seats.",
  introParagraph2: "Our database covers 500+ NAAC-accredited colleges with verified cutoff data, NIRF rankings, seat matrices, fee structures, and scholarship information. Whether you are a student appearing for NEET 2026, a JEE aspirant shortlisting IITs and NITs, or a parent comparing private vs government college fees — our counsellors help you make the right decision. Services are 100% free with zero obligation.",
  disclaimer: "All college data, rankings, and cutoffs on AdmissionToday are compiled from official sources including the National Institutional Ranking Framework (NIRF), NAAC, and respective university/college websites. Cutoffs are indicative based on previous years and may vary. Students are advised to verify information with the respective institutions before applying.",
  topics: [
    {
      heading: "MBBS & Medical Admission 2026",
      links: [
        { label: "MBBS Admission through NEET 2026", href: "/colleges?search=mbbs" },
        { label: "Top Government Medical Colleges India", href: "/colleges?collegeType=Government&search=medical" },
        { label: "Private MBBS Colleges — Fees & Cutoff", href: "/colleges?search=private+mbbs" },
        { label: "NEET State Quota Counselling", href: "/blogs?search=neet+state+quota" },
        { label: "Deemed University MBBS Admission", href: "/colleges?collegeType=Deemed&search=mbbs" },
        { label: "BDS & Dental College Admissions", href: "/colleges?search=bds" }
      ]
    },
    {
      heading: "Engineering Admission 2026",
      links: [
        { label: "IIT Admission via JEE Advanced 2026", href: "/colleges?search=iit" },
        { label: "NIT Colleges — JEE Main Cutoff", href: "/colleges?search=nit" },
        { label: "Top Private Engineering Colleges", href: "/colleges?collegeType=Private&search=engineering" },
        { label: "B.Tech CSE Colleges in India", href: "/colleges?search=btech+cse" },
        { label: "BITS Pilani & Top Deemed Colleges", href: "/colleges?search=bits" },
        { label: "Lateral Entry B.Tech Admissions", href: "/blogs?search=lateral+entry" }
      ]
    },
    {
      heading: "MBA & Management Admission",
      links: [
        { label: "IIM Admission — CAT Cutoff 2026", href: "/colleges?search=iim" },
        { label: "Top MBA Colleges without CAT", href: "/blogs?search=mba+without+cat" },
        { label: "XLRI, FMS, SPJIMR Admissions", href: "/colleges?search=top+mba" },
        { label: "Executive MBA Programs India", href: "/colleges?search=executive+mba" },
        { label: "MBA Fees & ROI Comparison", href: "/blogs?search=mba+fees" },
        { label: "One-year MBA Colleges India", href: "/colleges?search=one+year+mba" }
      ]
    },
    {
      heading: "Law Admission 2026",
      links: [
        { label: "NLU Admission via CLAT 2026", href: "/colleges?search=nlu" },
        { label: "Top Law Colleges in India", href: "/colleges?search=law" },
        { label: "AILET — NLU Delhi Admission", href: "/colleges?search=nlu+delhi" },
        { label: "BA LLB 5-Year Integrated Programs", href: "/colleges?search=ba+llb" },
        { label: "CLAT 2026 Cutoff & Seat Matrix", href: "/blogs?search=clat+cutoff" },
        { label: "Law Colleges by State", href: "/colleges?search=law+college" }
      ]
    }
  ],
  cities: [
    { city: "Delhi", href: "/colleges?state=Delhi" },
    { city: "Mumbai", href: "/colleges?state=Maharashtra" },
    { city: "Bangalore", href: "/colleges?state=Karnataka" },
    { city: "Chennai", href: "/colleges?state=Tamil+Nadu" },
    { city: "Hyderabad", href: "/colleges?state=Telangana" },
    { city: "Pune", href: "/colleges?state=Maharashtra&search=pune" },
    { city: "Kolkata", href: "/colleges?state=West+Bengal" },
    { city: "Chandigarh", href: "/colleges?state=Punjab" },
    { city: "Jaipur", href: "/colleges?state=Rajasthan" },
    { city: "Lucknow", href: "/colleges?state=Uttar+Pradesh" },
    { city: "Ahmedabad", href: "/colleges?state=Gujarat" },
    { city: "Coimbatore", href: "/colleges?state=Tamil+Nadu&search=coimbatore" }
  ],
  directoryTitle: "Explore Top Colleges Across India",
  directorySubtitle: "Browse colleges by state, stream, or entrance exam — updated for 2026 admissions.",
  quickLinks: [
    { label: "Top MBBS Colleges 2026", href: "/colleges?search=mbbs" },
    { label: "Best Engineering Colleges", href: "/colleges?search=engineering" },
    { label: "Top MBA Colleges", href: "/colleges?search=mba" },
    { label: "Best Law Colleges", href: "/colleges?search=law" },
    { label: "Government Colleges", href: "/colleges?collegeType=Government" },
    { label: "Deemed Universities", href: "/colleges?collegeType=Deemed" },
    { label: "NIRF Ranked Colleges", href: "/colleges?search=nirf" },
    { label: "Private Medical Colleges", href: "/colleges?search=private+medical" }
  ],
  examLinks: [
    { label: "NEET Counselling Guide", href: "/blogs?search=neet" },
    { label: "JEE Advanced Colleges", href: "/colleges?search=jee" },
    { label: "CAT / MBA Admissions", href: "/blogs?search=mba" },
    { label: "CLAT Law Colleges", href: "/colleges?search=law" },
    { label: "AIAPGET Ayurveda", href: "/colleges?search=ayurveda" },
    { label: "GATE M.Tech Colleges", href: "/colleges?search=mtech" }
  ]
};

export default function SeoContentSettingsPage() {
  const [formData, setFormData] = useState<SeoContentForm>(defaultSeoContent);
  const [fullSettings, setFullSettings] = useState<Partial<HomePageSettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // New item states
  const [newCityName, setNewCityName] = useState("");
  const [newCityHref, setNewCityHref] = useState("");

  const [newQuickLabel, setNewQuickLabel] = useState("");
  const [newQuickHref, setNewQuickHref] = useState("");

  const [newExamLabel, setNewExamLabel] = useState("");
  const [newExamHref, setNewExamHref] = useState("");

  useEffect(() => {
    void fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const homeSettings = await homePageService.getSettings();
      setFullSettings(homeSettings);
      if (homeSettings.seoContent) {
        setFormData({
          title: homeSettings.seoContent.title || defaultSeoContent.title,
          introParagraph1: homeSettings.seoContent.introParagraph1 || defaultSeoContent.introParagraph1,
          introParagraph2: homeSettings.seoContent.introParagraph2 || defaultSeoContent.introParagraph2,
          disclaimer: homeSettings.seoContent.disclaimer || defaultSeoContent.disclaimer,
          topics: Array.isArray(homeSettings.seoContent.topics)
            ? homeSettings.seoContent.topics
            : defaultSeoContent.topics,
          cities: Array.isArray(homeSettings.seoContent.cities)
            ? homeSettings.seoContent.cities
            : defaultSeoContent.cities,
          directoryTitle: homeSettings.seoContent.directoryTitle || defaultSeoContent.directoryTitle,
          directorySubtitle: homeSettings.seoContent.directorySubtitle || defaultSeoContent.directorySubtitle,
          quickLinks: Array.isArray(homeSettings.seoContent.quickLinks)
            ? homeSettings.seoContent.quickLinks
            : defaultSeoContent.quickLinks,
          examLinks: Array.isArray(homeSettings.seoContent.examLinks)
            ? homeSettings.seoContent.examLinks
            : defaultSeoContent.examLinks,
        });
      } else {
        setFormData(defaultSeoContent);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load SEO Content settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: Partial<HomePageSettings> = {
        ...fullSettings,
        seoContent: formData,
      };
      await homePageService.updateSettings(payload);
      toast.success("SEO Content settings updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update SEO Content settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Add/remove city
  const addCity = () => {
    if (!newCityName || !newCityHref) {
      toast.error("Please enter both City Name and Filter Link.");
      return;
    }
    setFormData({
      ...formData,
      cities: [...formData.cities, { city: newCityName, href: newCityHref }],
    });
    setNewCityName("");
    setNewCityHref("");
    toast.success(`City "${newCityName}" added successfully.`);
  };

  const removeCity = (index: number) => {
    const list = [...formData.cities];
    list.splice(index, 1);
    setFormData({ ...formData, cities: list });
  };

  // Quick Links
  const addQuickLink = () => {
    if (!newQuickLabel || !newQuickHref) {
      toast.error("Please enter both Link text and Target URL.");
      return;
    }
    setFormData({
      ...formData,
      quickLinks: [...formData.quickLinks, { label: newQuickLabel, href: newQuickHref }],
    });
    setNewQuickLabel("");
    setNewQuickHref("");
    toast.success("Popular search link added.");
  };

  const removeQuickLink = (index: number) => {
    const list = [...formData.quickLinks];
    list.splice(index, 1);
    setFormData({ ...formData, quickLinks: list });
  };

  // Exam Links
  const addExamLink = () => {
    if (!newExamLabel || !newExamHref) {
      toast.error("Please enter both Link text and Target URL.");
      return;
    }
    setFormData({
      ...formData,
      examLinks: [...formData.examLinks, { label: newExamLabel, href: newExamHref }],
    });
    setNewExamLabel("");
    setNewExamHref("");
    toast.success("Entrance exam link added.");
  };

  const removeExamLink = (index: number) => {
    const list = [...formData.examLinks];
    list.splice(index, 1);
    setFormData({ ...formData, examLinks: list });
  };

  // Add/remove links to topics
  const addLinkToTopic = (topicIndex: number) => {
    const list = [...formData.topics];
    list[topicIndex].links.push({ label: "New Link Title", href: "/colleges" });
    setFormData({ ...formData, topics: list });
  };

  const removeLinkFromTopic = (topicIndex: number, linkIndex: number) => {
    const list = [...formData.topics];
    list[topicIndex].links.splice(linkIndex, 1);
    setFormData({ ...formData, topics: list });
  };

  const updateTopicHeading = (index: number, val: string) => {
    const list = [...formData.topics];
    list[index].heading = val;
    setFormData({ ...formData, topics: list });
  };

  const updateLinkDetails = (topicIndex: number, linkIndex: number, field: keyof TopicLink, val: string) => {
    const list = [...formData.topics];
    list[topicIndex].links[linkIndex][field] = val;
    setFormData({ ...formData, topics: list });
  };

  // Add a new topic category card
  const addTopicSection = () => {
    setFormData({
      ...formData,
      topics: [
        ...formData.topics,
        { heading: "New Stream Admission 2026", links: [] },
      ],
    });
    toast.success("New topic category card added.");
  };

  const removeTopicSection = (index: number) => {
    const list = [...formData.topics];
    list.splice(index, 1);
    setFormData({ ...formData, topics: list });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-sm font-medium text-muted-foreground">
        Loading SEO Content Settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="sticky top-0 z-20 -mx-6 border-b border-border/50 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-card text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                SEO Content settings
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Edit the text copy, streams, links, cities, directories, and disclaimers displayed in the homepage SEO block.
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save SEO Content"}
          </Button>
        </div>
      </div>

      {/* Main Header & Paragraphs Card */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Header & Introduction
          </CardTitle>
          <CardDescription className="text-xs">
            Edit the main keyword-rich title and descriptions on the bottom of the page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="header-title" className="text-xs font-bold text-muted-foreground">
              Main SEO Header Title
            </Label>
            <Input
              id="header-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter main header title..."
              className="h-10 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="intro-p1" className="text-xs font-bold text-muted-foreground">
                Introduction Paragraph 1
              </Label>
              <Textarea
                id="intro-p1"
                value={formData.introParagraph1}
                onChange={(e) => setFormData({ ...formData, introParagraph1: e.target.value })}
                placeholder="Enter introduction paragraph 1..."
                className="min-h-[140px] text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intro-p2" className="text-xs font-bold text-muted-foreground">
                Introduction Paragraph 2
              </Label>
              <Textarea
                id="intro-p2"
                value={formData.introParagraph2}
                onChange={(e) => setFormData({ ...formData, introParagraph2: e.target.value })}
                placeholder="Enter introduction paragraph 2..."
                className="min-h-[140px] text-xs leading-relaxed"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topics Grid Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Admission Topics & Link Grids</h2>
            <p className="text-xs text-muted-foreground">Manage cards of quick search links by stream categories.</p>
          </div>
          <Button variant="outline" size="sm" onClick={addTopicSection}>
            <Plus className="h-4 w-4 mr-2" /> Add Category Card
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formData.topics.map((topic, topicIdx) => (
            <Card key={topicIdx} className="border-border/60 bg-card shadow-2xs relative">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center justify-between gap-4">
                  <Input
                    value={topic.heading}
                    onChange={(e) => updateTopicHeading(topicIdx, e.target.value)}
                    placeholder="Enter heading (e.g. Medical Admission 2026)"
                    className="h-9 font-bold text-slate-900 border-none bg-transparent hover:bg-slate-100/50 focus:bg-white pl-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => removeTopicSection(topicIdx)}
                    title="Remove this category block"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {topic.links.length === 0 ? (
                  <div className="text-center text-xs text-muted-foreground py-6 border border-dashed border-border/70 rounded-lg">
                    No links added yet. Click "Add Link" below.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topic.links.map((link, linkIdx) => (
                      <div key={linkIdx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-border/30">
                        <div className="flex-1 space-y-1">
                          <Input
                            value={link.label}
                            onChange={(e) => updateLinkDetails(topicIdx, linkIdx, "label", e.target.value)}
                            placeholder="Link text / Label"
                            className="h-7 text-xs bg-white"
                          />
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pl-1">
                            <Link2 className="h-3 w-3" />
                            <Input
                              value={link.href}
                              onChange={(e) => updateLinkDetails(topicIdx, linkIdx, "href", e.target.value)}
                              placeholder="/colleges?search=medical"
                              className="h-6 text-[10px] bg-white border-none py-0 px-1 text-blue-600 font-medium"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive shrink-0 hover:bg-destructive/10"
                          onClick={() => removeLinkFromTopic(topicIdx, linkIdx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8 border-dashed border-border/80"
                  onClick={() => addLinkToTopic(topicIdx)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Link
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CollegeSEOLinks Content - Directory Header and Links lists */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Explore Colleges Directory (CollegeSEOLinks)</CardTitle>
          <CardDescription className="text-xs">
            Edit titles and quick links list (Popular Searches, By Entrance Exams) rendered inside the directory block.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dir-title" className="text-xs font-bold text-muted-foreground">Directory Header Title</Label>
              <Input
                id="dir-title"
                value={formData.directoryTitle}
                onChange={(e) => setFormData({ ...formData, directoryTitle: e.target.value })}
                placeholder="Explore Top Colleges Across India"
                className="h-10 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dir-sub" className="text-xs font-bold text-muted-foreground">Directory Subtitle</Label>
              <Input
                id="dir-sub"
                value={formData.directorySubtitle}
                onChange={(e) => setFormData({ ...formData, directorySubtitle: e.target.value })}
                placeholder="Browse colleges by state..."
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-border/40 pt-6">
            {/* Popular Searches Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-900 uppercase tracking-wide">Popular Searches (Quick Links)</Label>
                <span className="text-[10px] font-bold text-muted-foreground">{formData.quickLinks.length} Items</span>
              </div>
              <div className="flex gap-2 bg-slate-50 p-2.5 rounded-lg border border-border/60">
                <Input
                  value={newQuickLabel}
                  onChange={(e) => setNewQuickLabel(e.target.value)}
                  placeholder="Link label (e.g. Top MBBS Colleges)"
                  className="h-8.5 text-xs bg-white flex-1"
                />
                <Input
                  value={newQuickHref}
                  onChange={(e) => setNewQuickHref(e.target.value)}
                  placeholder="URL (e.g. /colleges?search=mbbs)"
                  className="h-8.5 text-xs bg-white flex-1"
                />
                <Button type="button" size="sm" onClick={addQuickLink} className="h-8.5">
                  <Plus className="h-4.5 w-4.5 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {formData.quickLinks.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border/30 bg-background text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-950 truncate">{item.label}</p>
                      <p className="text-[10px] text-blue-600 truncate font-semibold mt-0.5">{item.href}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => removeQuickLink(idx)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-900 uppercase tracking-wide">By Entrance Exam Links</Label>
                <span className="text-[10px] font-bold text-muted-foreground">{formData.examLinks.length} Items</span>
              </div>
              <div className="flex gap-2 bg-slate-50 p-2.5 rounded-lg border border-border/60">
                <Input
                  value={newExamLabel}
                  onChange={(e) => setNewExamLabel(e.target.value)}
                  placeholder="Link label (e.g. NEET Guide)"
                  className="h-8.5 text-xs bg-white flex-1"
                />
                <Input
                  value={newExamHref}
                  onChange={(e) => setNewExamHref(e.target.value)}
                  placeholder="URL (e.g. /blogs?search=neet)"
                  className="h-8.5 text-xs bg-white flex-1"
                />
                <Button type="button" size="sm" onClick={addExamLink} className="h-8.5">
                  <Plus className="h-4.5 w-4.5 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {formData.examLinks.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border/30 bg-background text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-950 truncate">{item.label}</p>
                      <p className="text-[10px] text-blue-600 truncate font-semibold mt-0.5">{item.href}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => removeExamLink(idx)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cities and Disclaimer Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Cities Editor */}
        <Card className="xl:col-span-2 border-border/60 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Cities List</CardTitle>
            <CardDescription className="text-xs">Manage tag links for top educational hub cities.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add city form */}
            <div className="flex flex-col sm:flex-row gap-3 bg-muted/20 p-3 rounded-lg border border-border/50">
              <div className="flex-1 space-y-1">
                <Label htmlFor="city-name" className="text-[10px] font-bold text-muted-foreground uppercase">City Name</Label>
                <Input
                  id="city-name"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  placeholder="e.g. Pune"
                  className="h-8.5 text-xs bg-white"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label htmlFor="city-href" className="text-[10px] font-bold text-muted-foreground uppercase">Filter Href</Label>
                <Input
                  id="city-href"
                  value={newCityHref}
                  onChange={(e) => setNewCityHref(e.target.value)}
                  placeholder="e.g. /colleges?state=Maharashtra&search=pune"
                  className="h-8.5 text-xs bg-white"
                />
              </div>
              <Button type="button" onClick={addCity} className="sm:self-end h-8.5 px-3">
                <Plus className="h-4 w-4 mr-1.5" /> Add
              </Button>
            </div>

            {/* List */}
            {formData.cities.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-6 border border-dashed border-border/70 rounded-lg">
                No city tags added yet.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto pr-1">
                {formData.cities.map((tag, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-slate-50 pl-3.5 pr-2 py-1 text-xs font-semibold text-slate-800"
                    title={tag.href}
                  >
                    <span>Colleges in {tag.city}</span>
                    <button
                      type="button"
                      onClick={() => removeCity(idx)}
                      className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disclaimer Editor */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Disclaimer Text</CardTitle>
            <CardDescription className="text-xs">Disclaimer displayed at the bottom of the SEO content segment.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="disclaimer" className="text-xs font-bold text-muted-foreground">Disclaimer copy</Label>
              <Textarea
                id="disclaimer"
                value={formData.disclaimer}
                onChange={(e) => setFormData({ ...formData, disclaimer: e.target.value })}
                placeholder="Enter disclaimer text..."
                className="min-h-[160px] text-xs leading-relaxed"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-4 z-20 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 shadow-lg">
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save SEO Content"}
        </Button>
      </div>
    </div>
  );
}

// X inline helper
function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
