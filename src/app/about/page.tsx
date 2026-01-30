import React from "react";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6 text-center">About Unipeasy</h1>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
        <p className="text-lg mb-4">
          Unipeasy is a centralized, AI-powered platform designed to transform learning from a passive, one-way street into an active, adaptive, and deeply personal dialogue. We aim to function as a personal AI tutor for every student, empowering them with the tools they need to learn efficiently and build lasting knowledge.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">The Challenges We Solve</h2>
        <ul className="list-disc pl-6 text-lg mb-4">
          <li><strong>Complexity Overload:</strong> Students often face a "wall" of dense information in tough subjects, leading to passive reading without true comprehension.</li>
          <li><strong>Stressful Exam Prep:</strong> A lack of strategy often leads to inefficient study habits, last-minute cramming, and burnout.</li>
          <li><strong>The Skill Gap:</strong> Academic pressure often causes students to ignore the technical and soft skills required for real-world industry success.</li>
          <li><strong>Resource Fragmentation:</strong> Students waste countless hours searching through unverified or outdated notes from unreliable sources.</li>
          <li><strong>Knowledge Loss:</strong> Without a systematic way to revisit concepts, a significant amount of knowledge is lost shortly after exams.</li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Our Intelligent Solutions</h2>
        <ul className="list-disc pl-6 text-lg mb-4">
          <li><strong>AI Learning Assistant:</strong> Deconstructs complex topics into simple explanations, analogies, and mind maps with adaptive quizzes.</li>
          <li><strong>AI Exam Strategist:</strong> Generates prioritized, Pomodoro-based timetables tailored to your syllabus and learning pace.</li>
          <li><strong>AI Skill Accelerator:</strong> Provides structured "Skill Tracks" with instant, personalized AI feedback on technical and soft skill challenges.</li>
          <li><strong>Centralized Materials Hub:</strong> An admin-managed source for "topper-verified" study materials, organized by Branch, Year, and Subject.</li>
          <li><strong>Memory Palace:</strong> A digital library for saving AI-generated insights, designed for spaced repetition and long-term retention.</li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Powered by Modern Technology</h2>
        <ul className="list-disc pl-6 text-lg mb-4">
          <li><strong>Frontend:</strong> Next.js 14 (App Router) and React for high performance and a dynamic user interface.</li>
          <li><strong>Design:</strong> Tailwind CSS and ShadCN UI for a professional, accessible, and mobile-friendly design system.</li>
          <li><strong>Backend:</strong> Firebase (Authentication & Firestore) for secure user management and real-time database querying.</li>
          <li><strong>Artificial Intelligence:</strong> Google Gemini 2.5 Flash integrated via Genkit to provide advanced, reliable, and human-like reasoning.</li>
        </ul>
        <blockquote className="border-l-4 pl-4 italic text-gray-600">"Unipeasy is not just about notes; it is about empowering students with clarity, confidence, and convenience in their academic journey."</blockquote>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Meet the Visionaries</h2>
        <p className="text-lg mb-4">The Unipeasy mission is driven by a dedicated team of students committed to revolutionizing the academic experience.</p>
        <div className="mb-4">
          <h3 className="text-xl font-bold">Founder</h3>
          <p><strong>Yaswanth Sai Yelisetty</strong> – Founder & Visionary<br />B.Tech CSE Student at Dhanekula Institute of Engineering & Technology<br />Mission: Building a scalable, student-led business empire that solves real-world academic challenges through entrepreneurship and innovation.</p>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-bold">Core Management & Development</h3>
          <ul className="list-disc pl-6">
            <li><strong>T.G.S.Sriram:</strong> Team Manager & Material Creator. Leads team coordination, ensures progress tracking, and develops academic content.</li>
            <li><strong>Syamala:</strong> Outreach & Marketing Lead. Focuses on student onboarding across diverse branches and leading marketing initiatives.</li>
            <li><strong>Vaishnavi:</strong> Contributor Onboarding. Manages the interaction with new student contributors and defines content creation guidelines.</li>
            <li><strong>Jahnavi:</strong> Reference Specialist. Sources high-quality reference materials and transforms them into structured, student-friendly notes.</li>
            <li><strong>Ruthvik:</strong> Website Development. A core contributor responsible for building and maintaining the platform's technical architecture.</li>
          </ul>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-bold">The Content & Quality Engine</h3>
          <p className="mb-2 font-semibold">Our material creators and verifiers ensure that every unit on the platform meets the "topper-verified" standard:</p>
          <div className="mb-2">
            <strong>Content Verification:</strong>
            <ul className="list-disc pl-6">
              <li><strong>Varun:</strong> Reviews all unit-wise materials for clarity, structure, and correctness to ensure only refined content reaches the students.</li>
            </ul>
          </div>
          <div>
            <strong>Material Creation Team:</strong>
            <ul className="list-disc pl-6">
              <li><strong>Sravya:</strong> Involved in developing well-structured academic content aligned with student needs.</li>
              <li><strong>Vasanthi:</strong> Actively contributes to building student-focused academic resources.</li>
              <li><strong>Raju:</strong> Develops academic content focused on clarity and exam readiness.</li>
              <li><strong>Varun:</strong> Additionally contributes to the core material development pipeline.</li>
            </ul>
          </div>
        </div>
        <blockquote className="border-l-4 pl-4 italic text-gray-600">"Unipeasy is built by students, for students, growing as a national movement of empowerment and innovation."</blockquote>
      </section>
    </div>
  );
}
