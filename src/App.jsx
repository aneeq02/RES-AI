// import React, { useState, useEffect, useRef } from 'react';
// import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence, useInView, useAnimation } from 'framer-motion';

// // --- ASSETS & DATA ---
// const TEAM_MEMBERS = [
//   { 
//     name: 'Sarah', 
//     role: 'Senior Sales Executive', 
//     img: '/Lady_agent_1-removebg-preview.png', 
//     specialty: 'Outbound & Closing', 
//     desc: 'Expert at cold outreach and closing deals via email and voice. She never sleeps and never misses a quota.' 
//   },
//   { 
//     name: 'Nova', 
//     role: 'Social Media Strategist', 
//     img: '/lady_agent_2-removebg-preview.png', 
//     specialty: 'Content & Trends', 
//     desc: 'Manages your Instagram, X, and LinkedIn. She spots trends instantly and engages with your community 24/7.' 
//   },
//   { 
//     name: 'Maya', 
//     role: 'Customer Success Lead', 
//     img: '/lady_agent_3-removebg-preview.png', 
//     specialty: 'Support & Retention', 
//     desc: 'Provides empathetic, instant support to your customers. Resolves tickets in seconds, not days.' 
//   },
//   { 
//     name: 'Elena', 
//     role: 'Operations Manager', 
//     img: '/lady_agent_4-removebg-preview.png', 
//     specialty: 'Data & Logistics', 
//     desc: 'Organizes your Notion, manages schedules, and ensures your backend operations run without a hitch.' 
//   },
//   { 
//     name: 'Chloe', 
//     role: 'HR & Recruiting', 
//     img: '/lady_agent_5-removebg-preview.png', 
//     specialty: 'Talent Acquisition', 
//     desc: 'Scans thousands of resumes and schedules interviews with top candidates automatically.' 
//   },
// ];

// const FAQS = [
//   { q: "How do res agents integrate with my tools?", a: "Our agents connect directly with your existing stack—Slack, Gmail, HubSpot, and Notion—setup takes less than 5 minutes." },
//   { q: "Is my data secure?", a: "Absolutely. We use enterprise-grade encryption and never train our public models on your proprietary business data." },
//   { q: "Can I customize the agent's personality?", a: "Yes. You define the tone of voice, strictness, and creativity levels to match your brand identity perfectly." },
//   { q: "Do I need to know how to code?", a: "Zero coding required. If you can send a voice note, you can manage a res agent." },
// ];

// // --- ANIMATION VARIANTS ---
// const pageVariants = {
//   initial: { opacity: 0 },
//   in: { opacity: 1 },
//   out: { opacity: 0 }
// };

// const pageTransition = {
//   type: "tween",
//   ease: "easeInOut",
//   duration: 0.5
// };

// const containerStagger = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.15,
//       delayChildren: 0.2
//     }
//   }
// };

// const itemStagger = {
//   hidden: { opacity: 0, y: 30, scale: 0.95 },
//   show: { 
//     opacity: 1, 
//     y: 0, 
//     scale: 1,
//     transition: { type: "spring", stiffness: 50 } 
//   }
// };

// const backgroundGradient = {
//   animate: {
//     scale: [1, 1.2, 1],
//     opacity: [0.3, 0.5, 0.3],
//     rotate: [0, 90, 0],
//     transition: {
//       duration: 15,
//       repeat: Infinity,
//       ease: "linear"
//     }
//   }
// };

// // --- REUSABLE COMPONENTS ---

// const RevealOnScroll = ({ children, delay = 0 }) => {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
//   const controls = useAnimation();

//   useEffect(() => {
//     if (isInView) {
//       controls.start("visible");
//     }
//   }, [isInView, controls]);

//   return (
//     <motion.div
//       ref={ref}
//       variants={{
//         hidden: { opacity: 0, y: 50 },
//         visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: delay, ease: "easeOut" } },
//       }}
//       initial="hidden"
//       animate={controls}
//     >
//       {children}
//     </motion.div>
//   );
// };

// // --- LOGO COMPONENT ---
// const Logo = () => (
//   <span className="text-3xl md:text-4xl font-black tracking-tighter text-white italic relative z-50 select-none">
//     <span className="text-red-600">r</span>e<span className="text-red-600">s</span>
//   </span>
// );

// const GetStartedModal = ({ isOpen, onClose }) => (
//   <AnimatePresence>
//     {isOpen && (
//       <div className="fixed inset-0 z-[10000] flex items-center justify-center px-6">
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
//         <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="glass-panel bg-zinc-900 w-full max-w-md p-10 rounded-[3rem] border border-white/10 relative z-10 shadow-2xl">
//           <button onClick={onClose} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition">✕</button>
//           <div className="mb-2"><Logo /></div>
//           <p className="text-zinc-500 mb-8 text-sm lowercase tracking-tight">Start your journey with autonomous AI helpers.</p>
//           <div className="space-y-4">
//             <input type="email" placeholder="Work email" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-red-600 transition" />
//             <Link to="/checkout" onClick={onClose}>
//                 <button className="w-full mt-4 bg-red-600 text-white py-4 rounded-full font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition uppercase text-xs tracking-widest">Create Account</button>
//             </Link>
//           </div>
//         </motion.div>
//       </div>
//     )}
//   </AnimatePresence>
// );

// const MobileMenu = ({ isOpen, onClose, onOpenGetStarted }) => (
//   <AnimatePresence>
//     {isOpen && (
//       <motion.div 
//         initial={{ opacity: 0, height: 0 }}
//         animate={{ opacity: 1, height: "100vh" }}
//         exit={{ opacity: 0, height: 0 }}
//         className="fixed inset-0 z-[9998] bg-black/95 backdrop-blur-xl flex flex-col pt-32 px-8 overflow-y-auto"
//       >
//         <div className="flex flex-col space-y-8 text-2xl font-bold uppercase tracking-widest text-white pb-10">
//           <Link to="/" onClick={onClose} className="hover:text-red-600 transition">Home</Link>
//           <div className="flex flex-col space-y-4 pl-4 border-l border-white/10">
//              <Link to="/crm" onClick={onClose} className="text-sm text-zinc-400 hover:text-red-500">CRM</Link>
//              <Link to="/website-management" onClick={onClose} className="text-sm text-zinc-400 hover:text-red-500">Website Mgmt</Link>
//              <Link to="/agents" onClick={onClose} className="text-sm text-zinc-400 hover:text-red-500">AI Agents</Link>
//           </div>
//           <Link to="/agents" onClick={onClose} className="hover:text-red-600 transition">Agents Team</Link>
//           <Link to="/pricing" onClick={onClose} className="hover:text-red-600 transition">Pricing</Link>
//           <Link to="/about" onClick={onClose} className="hover:text-red-600 transition">About</Link>
//           <Link to="/contact" onClick={onClose} className="hover:text-red-600 transition">Contact</Link>
//         </div>
//         <button onClick={() => { onClose(); onOpenGetStarted(); }} className="mb-10 w-full bg-red-600 text-white py-5 rounded-full font-black uppercase tracking-widest text-sm shrink-0">
//           Get Started
//         </button>
//       </motion.div>
//     )}
//   </AnimatePresence>
// );

// const Navbar = ({ onOpenGetStarted }) => {
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 50);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   return (
//     <>
//       <nav className={`fixed top-0 w-full z-[9999] px-6 md:px-8 py-5 flex justify-between items-center transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
//         <Link to="/"><Logo /></Link>
        
//         <div className="hidden lg:flex space-x-8 text-[11px] font-bold uppercase tracking-widest text-zinc-500 items-center">
//           <div className="relative group py-2">
//             <Link to="/services" className="hover:text-white transition flex items-center gap-1 cursor-pointer">
//               Services <span className="text-[8px] opacity-40 group-hover:rotate-180 transition-transform duration-300">▼</span>
//             </Link>
//             <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
//                <div className="glass-panel bg-black/95 rounded-[2rem] p-6 w-[200px] border border-white/10 text-white flex flex-col gap-4 shadow-2xl">
//                   <Link to="/crm" className="hover:text-red-500 transition">CRM</Link>
//                   <Link to="/website-management" className="hover:text-red-500 transition">Website Management</Link>
//                   <Link to="/agents" className="text-red-500 hover:text-white transition">AI Agents</Link>
//                </div>
//             </div>
//           </div>
//           <Link to="/about" className="hover:text-white transition">About</Link>
//           <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
//           <Link to="/faq" className="hover:text-white transition">FAQ</Link>
//           <Link to="/contact" className="hover:text-white transition">Contact</Link>
//         </div>

//         <div className="flex items-center gap-4">
//            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="lg:hidden text-white z-[10000]">
//              {isMobileOpen ? '✕' : '☰'}
//            </button>
//            <button onClick={onOpenGetStarted} className="hidden lg:block bg-red-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase hover:bg-red-700 transition hover:scale-105 active:scale-95 shadow-lg shadow-red-600/20">Get Started</button>
//         </div>
//       </nav>
//       <MobileMenu isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} onOpenGetStarted={onOpenGetStarted} />
//     </>
//   );
// };

// const PageWrapper = ({ children }) => (
//   <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full">
//     {children}
//   </motion.div>
// );

// // --- PAGES ---

// const Home = () => (
//   <PageWrapper>
//     <main className="bg-black text-white overflow-x-hidden min-h-screen relative">
//        <motion.div variants={backgroundGradient} animate="animate" className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-red-600/20 to-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

//       {/* Hero Section */}
//       <section className="min-h-screen flex flex-col justify-center px-6 md:px-8 py-20">
//         <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
//           <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }} className="relative z-10 lg:pt-0">
//             <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-[85px] font-black leading-[0.95] tracking-tighter mb-6 md:mb-8 break-words">
//               AI Employees: <br/>Your Helpers That <span className="text-red-600">Never Sleep.</span>
//             </h1>

//             <p className="text-lg md:text-xl text-zinc-100 max-w-md mb-8 md:mb-10 leading-relaxed">
//               Build, grow, and scale your business with a team of autonomous agents that integrate seamlessly into your workflow.
//             </p>
            
//             <div className="flex flex-col sm:flex-row gap-4">
//               <Link to="/agents" className="w-full sm:w-auto">
//                 <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto bg-red-600 text-white px-10 py-5 rounded-full text-lg font-bold shadow-2xl shadow-red-500/20 uppercase tracking-widest">
//                   View Team
//                 </motion.button>
//               </Link>
//               <Link to="/services" className="w-full sm:w-auto">
//                 <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto bg-zinc-900 border border-white/10 text-white px-10 py-5 rounded-full text-lg font-bold uppercase tracking-widest hover:bg-zinc-800 transition">
//                   Explore Services
//                 </motion.button>
//               </Link>
//             </div>
//           </motion.div>
          
//           <div className="relative flex justify-center items-center mt-10 lg:mt-0">
//             <div className="w-full max-w-lg aspect-[4/5] lg:aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative z-10">
//                <video 
//                  autoPlay 
//                  loop 
//                  muted 
//                  playsInline 
//                  className="w-full h-full object-cover"
//                  style={{ objectPosition: "75% center" }}
//                >
//                  <source src="/animation homepage.mp4" type="video/mp4" />
//                  Your browser does not support the video tag.
//                </video>
//                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
//             </div>
//             <div className="absolute inset-0 bg-red-600/20 blur-[100px] -z-10 rounded-full" />
//           </div>
//         </div>
//       </section>

//       {/* Feature Section */}
//       <section className="py-20 md:py-32 px-6 md:px-8 bg-zinc-950/50">
//         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
//           <RevealOnScroll>
//              <h2 className="text-4xl md:text-6xl font-black mb-6 md:mb-8 italic tracking-tighter leading-none">Automates work. <br/>Even while you sleep.</h2>
//              <p className="text-zinc-100 text-base md:text-lg mb-8">Let your AI team handle social media posts, customer support tickets, and data entry while you focus on high-level strategy.</p>
//           </RevealOnScroll>
//           <RevealOnScroll delay={0.2}>
//             <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] border border-white/5 bg-red-600/5 flex items-center gap-6">
//                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border border-white/10 bg-zinc-800 flex-shrink-0 relative">
//                     <video 
//                       autoPlay 
//                       loop 
//                       muted 
//                       playsInline 
//                       className="w-full h-full object-cover"
//                       style={{ objectPosition: 'center' }} 
//                     >
//                       <source src="/blonde girl animation.mp4" type="video/mp4" />
//                     </video>
//                  </div>
                 
//                  <div>
//                     <h4 className="font-bold text-red-500 mb-1 text-sm md:text-base">Sarah is typing...</h4>
//                     <p className="text-white text-lg md:text-2xl font-black italic">"I've scheduled your posts for next week!"</p>
//                  </div>
//             </div>
//           </RevealOnScroll>
//         </div>
//       </section>
//     </main>
//   </PageWrapper>
// );

// const AgentsPage = () => (
//   <PageWrapper>
//     <div className="pt-32 pb-20 px-6 md:px-8 max-w-7xl mx-auto min-h-screen bg-black text-white relative">
//       <div className="text-center mb-16 md:mb-24">
//         <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block py-1 px-3 rounded-full bg-red-600/10 border border-red-600/20 text-[10px] font-bold uppercase tracking-widest mb-6 text-red-500">Your Future Team</motion.span>
//         <motion.h1 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl md:text-7xl font-black mb-6 italic tracking-tighter">Meet the <span className="text-red-600">Specialists</span></motion.h1>
//       </div>

//       <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {TEAM_MEMBERS.map((member, i) => (
//           <motion.div 
//             key={i} 
//             variants={itemStagger}
//             className="group glass-panel p-6 md:p-8 rounded-[2.5rem] border border-white/10 bg-zinc-900/40 hover:bg-zinc-900 hover:border-red-500/30 transition-all duration-500 flex flex-col sm:flex-row gap-6 md:gap-8 items-center cursor-pointer"
//           >
//             <div className="w-full sm:w-1/3 aspect-[3/4] rounded-[2rem] overflow-hidden relative shadow-2xl bg-zinc-800/50">
//               <img src={member.img} alt={member.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110" />
//               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
//             </div>
//             <div className="flex-1 text-center sm:text-left">
//                <h2 className="text-3xl font-black italic tracking-tighter mb-1">{member.name}</h2>
//                <p className="text-red-500 font-bold uppercase text-xs tracking-widest mb-3">{member.role}</p>
//                <div className="inline-block bg-white/5 px-3 py-1 rounded-full text-[10px] text-zinc-400 border border-white/10 mb-4">{member.specialty}</div>
//                <p className="text-zinc-400 text-sm leading-relaxed mb-6">{member.desc}</p>
//                <button className="w-full bg-white text-black py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition shadow-lg transform active:scale-95">Hire {member.name}</button>
//             </div>
//           </motion.div>
//         ))}
//       </motion.div>
//     </div>
//   </PageWrapper>
// );

// const ServicesPage = () => (
//   <PageWrapper>
//     <div className="pt-32 pb-20 px-6 md:px-8 max-w-7xl mx-auto min-h-screen bg-black text-white">
//       <RevealOnScroll>
//         <div className="text-center mb-16 md:mb-24">
//           <h1 className="text-5xl md:text-7xl font-black mb-4 italic tracking-tighter">Our Services</h1>
//           <p className="text-zinc-100 text-lg max-w-2xl mx-auto">Comprehensive solutions to automate your workflow.</p>
//         </div>
//       </RevealOnScroll>

//       <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        
//         <Link to="/crm">
//           <motion.div variants={itemStagger} className="glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/10 bg-zinc-900/50 hover:border-red-500/50 transition duration-500 h-full group">
//             <div className="flex justify-between items-start">
//                 <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-red-500 transition">CRM</h3>
//                 <span className="text-2xl transform group-hover:translate-x-2 transition">→</span>
//             </div>
//             <p className="text-zinc-100 mb-6">Connect your entire sales pipeline with automated follow-ups.</p>
//           </motion.div>
//         </Link>
        
//         <Link to="/website-management">
//           <motion.div variants={itemStagger} className="glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/10 bg-zinc-900/50 hover:border-red-500/50 transition duration-500 h-full group">
//             <div className="flex justify-between items-start">
//                 <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-red-500 transition">Website Management</h3>
//                 <span className="text-2xl transform group-hover:translate-x-2 transition">→</span>
//             </div>
//             <p className="text-zinc-100 mb-6">Full stack development and maintenance for your digital presence.</p>
//           </motion.div>
//         </Link>

//         {/* AI Agents */}
//         <Link to="/agents">
//           <motion.div variants={itemStagger} className="glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/10 bg-zinc-900/50 hover:border-red-500/50 transition duration-500 h-full group">
//              <div className="flex justify-between items-start">
//                 <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-red-500 transition">AI Agents</h3>
//                 <span className="text-2xl transform group-hover:translate-x-2 transition">→</span>
//              </div>
//              <p className="text-zinc-100 group-hover:text-zinc-100">Meet our specialized team of AI employees ready to work for you.</p>
//           </motion.div>
//         </Link>
//       </motion.div>
//     </div>
//   </PageWrapper>
// );

// const PricingPage = () => {
//   const navigate = useNavigate();

//   const AgentGroup = () => (
//     <div className="flex items-end justify-center mb-4 relative h-32 w-full">
//        <div className="absolute left-1/2 -translate-x-[120%] bottom-0 w-24 h-28 z-0 opacity-80">
//          <img src="/lady_agent_2-removebg-preview.png" className="w-full h-full object-contain object-bottom drop-shadow-lg" alt="Agent 2" />
//        </div>
//        <div className="absolute left-1/2 -translate-x-[-20%] bottom-0 w-24 h-28 z-0 opacity-80">
//          <img src="/lady_agent_3-removebg-preview.png" className="w-full h-full object-contain object-bottom drop-shadow-lg" alt="Agent 3" />
//        </div>
//        <div className="relative z-10 w-32 h-36 -mb-2"> 
//          <img src="/Lady_agent_1-removebg-preview.png" className="w-full h-full object-contain object-bottom drop-shadow-2xl" alt="Main Agent" />
//        </div>
//     </div>
//   );

//   const goToCheckout = (plan) => {
//     navigate('/checkout', { state: { plan } });
//   };

//   return (
//     <PageWrapper>
//       <div className="pt-32 pb-20 px-6 md:px-8 max-w-7xl mx-auto min-h-screen text-white text-center">
//         <RevealOnScroll>
//           <h1 className="text-5xl md:text-6xl font-black mb-6 italic tracking-tighter">Choose <span className="text-red-600">res</span> at a price that fits you</h1>
//           <p className="text-zinc-500 mb-20 text-lg">The sale you've been waiting for.</p>
//         </RevealOnScroll>
        
//         <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid md:grid-cols-3 gap-8 items-end max-w-6xl mx-auto">
//           {/* Card 1 */}
//           <motion.div variants={itemStagger} className="glass-panel bg-black rounded-[2rem] border border-white/10 overflow-hidden relative group p-8 transition-all duration-300 hover:border-red-600 hover:shadow-[0_0_50px_rgba(220,38,38,0.2)] hover:scale-105 hover:z-20 hover:bg-zinc-900">
//             <AgentGroup />
//             <div className="text-left mt-4 border-t border-white/10 pt-6">
//               <div className="flex justify-between items-center mb-2">
//                  <h3 className="text-lg font-bold text-white">1-month plan</h3>
//                  <span className="bg-zinc-800 text-xs py-1 px-2 rounded-lg text-zinc-400 group-hover:bg-red-600/20 group-hover:text-red-400 transition-colors">Save 50%</span>
//               </div>
//               <div className="flex items-baseline gap-2 mb-8">
//                 <span className="text-zinc-600 text-xl line-through decoration-red-500 decoration-2 font-bold">$97</span>
//                 <span className="text-4xl font-black text-white">$48.50<span className="text-sm text-zinc-500 font-normal">/mo</span></span>
//               </div>
//               <button onClick={() => goToCheckout('1-Month')} className="w-full py-4 rounded-full border border-white/20 transition-all duration-300 font-bold text-sm uppercase tracking-widest mb-6 group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white group-hover:shadow-lg">Get Res</button>
//               <div className="flex items-center gap-2 justify-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
//                  <span>✓</span> 14-day money-back guarantee
//               </div>
//             </div>
//           </motion.div>

//           {/* Card 2 (Most Popular) */}
//           <motion.div variants={itemStagger} className="bg-zinc-900 rounded-[2rem] border-2 border-red-600 overflow-hidden relative group p-8 shadow-[0_0_50px_rgba(220,38,38,0.2)] transform scale-105 z-10">
//             <div className="absolute top-0 left-0 w-full bg-red-600 text-white text-center text-xs font-bold uppercase tracking-widest py-2">Most Popular</div>
//             <div className="mt-8"><AgentGroup /></div>
//             <div className="text-left mt-4 border-t border-white/10 pt-6">
//               <div className="flex justify-between items-center mb-2">
//                  <h3 className="text-lg font-bold text-white">12-month plan</h3>
//                  <span className="bg-red-600/20 text-red-400 text-xs py-1 px-2 rounded-lg font-bold">Save 70%</span>
//               </div>
//               <div className="flex items-baseline gap-2 mb-8">
//                 <span className="text-zinc-500 text-xl line-through decoration-red-500 decoration-2 font-bold">$52</span>
//                 <span className="text-5xl font-black text-white">$15.60<span className="text-sm text-zinc-500 font-normal">/mo</span></span>
//               </div>
//               <button onClick={() => goToCheckout('12-Month')} className="w-full py-4 rounded-full bg-red-600 text-white hover:bg-red-500 transition font-bold text-sm uppercase tracking-widest mb-6 shadow-lg shadow-red-600/30">Get Res</button>
//               <div className="flex items-center gap-2 justify-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
//                  <span>✓</span> 14-day money-back guarantee
//               </div>
//             </div>
//           </motion.div>

//           {/* Card 3 */}
//           <motion.div variants={itemStagger} className="glass-panel bg-black rounded-[2rem] border border-white/10 overflow-hidden relative group p-8 transition-all duration-300 hover:border-red-600 hover:shadow-[0_0_50px_rgba(220,38,38,0.2)] hover:scale-105 hover:z-20 hover:bg-zinc-900">
//             <AgentGroup />
//             <div className="text-left mt-4 border-t border-white/10 pt-6">
//               <div className="flex justify-between items-center mb-2">
//                  <h3 className="text-lg font-bold text-white">3-month plan</h3>
//                  <span className="bg-zinc-800 text-xs py-1 px-2 rounded-lg text-zinc-400 group-hover:bg-red-600/20 group-hover:text-red-400 transition-colors">Save 60%</span>
//               </div>
//               <div className="flex items-baseline gap-2 mb-8">
//                 <span className="text-zinc-600 text-xl line-through decoration-red-500 decoration-2 font-bold">$59</span>
//                 <span className="text-4xl font-black text-white">$23.60<span className="text-sm text-zinc-500 font-normal">/mo</span></span>
//               </div>
//               <button onClick={() => goToCheckout('3-Month')} className="w-full py-4 rounded-full border border-white/20 transition-all duration-300 font-bold text-sm uppercase tracking-widest mb-6 group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white group-hover:shadow-lg">Get Res</button>
//               <div className="flex items-center gap-2 justify-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
//                  <span>✓</span> 14-day money-back guarantee
//               </div>
//             </div>
//           </motion.div>
//         </motion.div>
//       </div>
//     </PageWrapper>
//   );
// };

// // --- UPDATED ABOUT PAGE (Pushes image below fold) ---
// const AboutPage = () => (
//   <PageWrapper>
//     <div className="bg-black text-white min-h-screen">
//       <div className="min-h-[90vh] flex flex-col items-center justify-center px-6 md:px-8 pt-20">
//         <RevealOnScroll>
//           <div className="max-w-4xl mx-auto text-center">
//             <h1 className="text-5xl md:text-8xl font-black mb-8 italic tracking-tighter">We build the <br/> workforce of the future.</h1>
//             <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-red-400">Our Story</span>
//           </div>
//         </RevealOnScroll>
//       </div>

//       <div className="px-6 md:px-8 pb-32">
//         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
//           <RevealOnScroll delay={0.2}>
//             <div className="rounded-[3rem] overflow-hidden border border-white/10 h-[400px] md:h-[500px]">
//               <img src="/lady_agent_2-removebg-preview.png" alt="Vision" className="w-full h-full object-cover object-top bg-zinc-900/50" />
//             </div>
//           </RevealOnScroll>
//           <RevealOnScroll delay={0.4}>
//             <div>
//               <h3 className="text-3xl md:text-4xl font-bold mb-6">Why we exist</h3>
//               <p className="text-zinc-100 text-lg mb-6 leading-relaxed">
//                 Traditional hiring is slow, expensive, and limited by geography. Res provides instant access to top-tier AI talent that is trained, compliant, and ready to work from day one.
//               </p>
//             </div>
//           </RevealOnScroll>
//         </div>
//       </div>
//     </div>
//   </PageWrapper>
// );

// const FAQPage = () => (
//   <PageWrapper>
//     <div className="pt-32 pb-20 px-6 md:px-8 max-w-3xl mx-auto min-h-screen text-white">
//       <h1 className="text-5xl md:text-6xl font-black mb-16 italic tracking-tighter text-center">Questions?</h1>
//       <motion.div variants={containerStagger} initial="hidden" animate="show" className="space-y-6">
//         {FAQS.map((item, i) => (
//           <motion.div 
//             key={i} 
//             variants={itemStagger}
//             className="group bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 md:p-8 hover:border-red-600/30 transition duration-300"
//           >
//             <h3 className="text-lg md:text-xl font-bold mb-3 group-hover:text-red-500 transition">{item.q}</h3>
//             <p className="text-zinc-100 text-sm md:text-base leading-relaxed">{item.a}</p>
//           </motion.div>
//         ))}
//       </motion.div>
//     </div>
//   </PageWrapper>
// );

// const ContactPage = () => (
//   <PageWrapper>
//     <div className="pt-32 pb-20 px-6 md:px-8 max-w-7xl mx-auto min-h-screen text-white">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
//         <RevealOnScroll>
//           <div>
//             <h1 className="text-5xl md:text-7xl font-black mb-8 italic tracking-tighter">Let's build <br/>your team.</h1>
//             <p className="text-zinc-100 text-lg mb-8">Ready to automate? Fill out the form and our onboarding AI will reach out instantly.</p>
//             <div className="space-y-4 text-zinc-100">
//               <p>hello@res.ai</p>
//               <p>+1 (555) 000-0000</p>
//             </div>
//           </div>
//         </RevealOnScroll>
        
//         <RevealOnScroll delay={0.3}>
//           <form className="glass-panel p-6 md:p-10 rounded-[2.5rem] border border-white/10 bg-zinc-900">
//             <div className="space-y-6">
//               <div>
//                 <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Name</label>
//                 <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition" />
//               </div>
//               <div>
//                 <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Email</label>
//                 <input type="email" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition" />
//               </div>
//               <div>
//                 <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Message</label>
//                 <textarea rows="4" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition"></textarea>
//               </div>
//               <button className="w-full bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-200 transition">Send Message</button>
//             </div>
//           </form>
//         </RevealOnScroll>
//       </div>
//     </div>
//   </PageWrapper>
// );

// // --- UPDATED: CRM PAGE WITH CONTENT ---
// const CRMPage = () => (
//   <PageWrapper>
//     <div className="pt-32 pb-20 px-6 md:px-8 max-w-7xl mx-auto min-h-screen text-white">
//       <RevealOnScroll>
//         <div className="text-center mb-16 md:mb-24 max-w-4xl mx-auto">
//           <span className="inline-block py-1 px-3 rounded-full bg-red-600/10 border border-red-600/20 text-[10px] font-bold uppercase tracking-widest mb-6 text-red-500">Intelligent Pipelines</span>
//           <h1 className="text-5xl md:text-7xl font-black mb-8 italic tracking-tighter">CRM Solutions that <span className="text-red-600">Close Deals.</span></h1>
//           <p className="text-zinc-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
//             Stop losing leads to slow responses. Our AI-powered CRM systems integrate seamlessly with your workflow, ensuring every opportunity is captured, nurtured, and converted automatically.
//           </p>
//         </div>
//       </RevealOnScroll>

//       <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
//         {/* Feature 1 */}
//         <motion.div variants={itemStagger} className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-white/10 bg-zinc-900/50 hover:border-red-500/50 transition duration-500 relative overflow-hidden group">
//           <div className="text-red-600/10 absolute -top-10 -right-10 text-[150px] font-black italic select-none group-hover:text-red-600/20 transition">01</div>
//           <h3 className="text-2xl font-bold mb-4 relative z-10">Automated Outreach</h3>
//           <p className="text-zinc-100 relative z-10 leading-relaxed">Forget manual follow-ups. Our agents send personalized emails and texts instantly when a lead enters your pipeline, keeping them engaged 24/7.</p>
//         </motion.div>
//         {/* Feature 2 */}
//         <motion.div variants={itemStagger} className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-white/10 bg-zinc-900/50 hover:border-red-500/50 transition duration-500 relative overflow-hidden group">
//           <div className="text-red-600/10 absolute -top-10 -right-10 text-[150px] font-black italic select-none group-hover:text-red-600/20 transition">02</div>
//           <h3 className="text-2xl font-bold mb-4 relative z-10">Smart Lead Scoring</h3>
//           <p className="text-zinc-100 relative z-10 leading-relaxed">AI analyzes prospect behavior to prioritize your hottest leads. Focus your human team's energy only on people ready to buy right now.</p>
//         </motion.div>
//         {/* Feature 3 */}
//         <motion.div variants={itemStagger} className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-white/10 bg-zinc-900/50 hover:border-red-500/50 transition duration-500 relative overflow-hidden group">
//            <div className="text-red-600/10 absolute -top-10 -right-10 text-[150px] font-black italic select-none group-hover:text-red-600/20 transition">03</div>
//           <h3 className="text-2xl font-bold mb-4 relative z-10">Seamless Integration</h3>
//           <p className="text-zinc-100 relative z-10 leading-relaxed">Works where you work. Connects flawlessly with Slack, Gmail, Outlook, HubSpot, and Salesforce without disrupting your current operations.</p>
//         </motion.div>
//         {/* Feature 4 */}
//         <motion.div variants={itemStagger} className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-white/10 bg-zinc-900/50 hover:border-red-500/50 transition duration-500 relative overflow-hidden group">
//            <div className="text-red-600/10 absolute -top-10 -right-10 text-[150px] font-black italic select-none group-hover:text-red-600/20 transition">04</div>
//           <h3 className="text-2xl font-bold mb-4 relative z-10">Visual Pipeline & Analytics</h3>
//           <p className="text-zinc-100 relative z-10 leading-relaxed">Get a clear bird's-eye view of your sales funnel. Track performance, identify bottlenecks, and forecast revenue with real-time data dashboards.</p>
//         </motion.div>
//       </motion.div>

//       <RevealOnScroll>
//         <div className="glass-panel p-10 md:p-16 rounded-[3rem] border border-white/10 bg-zinc-900 text-center relative overflow-hidden">
//           <div className="absolute inset-0 bg-red-600/10 blur-[100px] -z-10 pointer-events-none"></div>
//            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-6">Ready to upgrade your sales stack?</h2>
//            <p className="text-zinc-100 text-lg mb-8 max-w-xl mx-auto">Book a demo today and see how our AI CRM can double your conversion rates.</p>
//            <Link to="/contact">
//              <button className="bg-red-600 text-white px-10 py-5 rounded-full text-sm font-bold shadow-2xl shadow-red-500/20 uppercase tracking-widest hover:bg-red-700 transition hover:scale-105 active:scale-95">Get Started Now</button>
//            </Link>
//         </div>
//       </RevealOnScroll>
//     </div>
//   </PageWrapper>
// );

// // --- UPDATED: WEBSITE MANAGEMENT PAGE WITH CONTENT ---
// const WebsiteManagementPage = () => (
//   <PageWrapper>
//     <div className="pt-32 pb-20 px-6 md:px-8 max-w-7xl mx-auto min-h-screen text-white">
//       <RevealOnScroll>
//         <div className="text-center mb-16 md:mb-24 max-w-4xl mx-auto">
//         <span className="inline-block py-1 px-3 rounded-full bg-red-600/10 border border-red-600/20 text-[10px] font-bold uppercase tracking-widest mb-6 text-red-500">Digital Presence</span>
//           <h1 className="text-5xl md:text-7xl font-black mb-8 italic tracking-tighter">Website Management & <span className="text-red-600">Growth.</span></h1>
//           <p className="text-zinc-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
//             Your website is your most important employee. We ensure it's fast, secure, and constantly evolving with full-stack development and proactive maintenance.
//           </p>
//         </div>
//       </RevealOnScroll>

//        <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
//         {/* Feature 1 */}
//         <motion.div variants={itemStagger} className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-white/10 bg-zinc-900/50 hover:border-red-500/50 transition duration-500 relative overflow-hidden group">
//           <div className="text-red-600/10 absolute -top-10 -right-10 text-[150px] font-black italic select-none group-hover:text-red-600/20 transition">01</div>
//           <h3 className="text-2xl font-bold mb-4 relative z-10">24/7 Uptime & Security Monitoring</h3>
//           <p className="text-zinc-100 relative z-10 leading-relaxed">We watch your site so you don't have to. Instant alerts for downtime and proactive defense against security threats and vulnerabilities.</p>
//         </motion.div>
//         {/* Feature 2 */}
//         <motion.div variants={itemStagger} className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-white/10 bg-zinc-900/50 hover:border-red-500/50 transition duration-500 relative overflow-hidden group">
//           <div className="text-red-600/10 absolute -top-10 -right-10 text-[150px] font-black italic select-none group-hover:text-red-600/20 transition">02</div>
//           <h3 className="text-2xl font-bold mb-4 relative z-10">Performance & Speed Optimization</h3>
//           <p className="text-zinc-100 relative z-10 leading-relaxed">A slow site kills conversions. We continuously optimize images, code, and server response times to ensure lightning-fast loading for global visitors.</p>
//         </motion.div>
//         {/* Feature 3 */}
//         <motion.div variants={itemStagger} className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-white/10 bg-zinc-900/50 hover:border-red-500/50 transition duration-500 relative overflow-hidden group">
//            <div className="text-red-600/10 absolute -top-10 -right-10 text-[150px] font-black italic select-none group-hover:text-red-600/20 transition">03</div>
//           <h3 className="text-2xl font-bold mb-4 relative z-10">Full-Stack Custom Development</h3>
//           <p className="text-zinc-100 relative z-10 leading-relaxed">Need a new feature? Our team handles everything from front-end React interfaces to complex back-end Node.js integrations and database management.</p>
//         </motion.div>
//         {/* Feature 4 */}
//         <motion.div variants={itemStagger} className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-white/10 bg-zinc-900/50 hover:border-red-500/50 transition duration-500 relative overflow-hidden group">
//            <div className="text-red-600/10 absolute -top-10 -right-10 text-[150px] font-black italic select-none group-hover:text-red-600/20 transition">04</div>
//           <h3 className="text-2xl font-bold mb-4 relative z-10">Content Updates & SEO</h3>
//           <p className="text-zinc-100 relative z-10 leading-relaxed">Keep your site fresh without lifting a finger. We handle routine content updates and ensure technical SEO best practices are always met.</p>
//         </motion.div>
//       </motion.div>

//       <RevealOnScroll>
//         <div className="glass-panel p-10 md:p-16 rounded-[3rem] border border-white/10 bg-zinc-900 text-center relative overflow-hidden">
//           <div className="absolute inset-0 bg-red-600/10 blur-[100px] -z-10 pointer-events-none"></div>
//            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-6">Ensure your digital storefront never closes.</h2>
//            <p className="text-zinc-100 text-lg mb-8 max-w-xl mx-auto">Let our team handle the technical headaches so you can focus on growing your business.</p>
//            <Link to="/contact">
//              <button className="bg-red-600 text-white px-10 py-5 rounded-full text-sm font-bold shadow-2xl shadow-red-500/20 uppercase tracking-widest hover:bg-red-700 transition hover:scale-105 active:scale-95">Contact Us</button>
//            </Link>
//         </div>
//       </RevealOnScroll>
//     </div>
//   </PageWrapper>
// );

// const CheckoutPage = () => {
//   const location = useLocation();
//   const selectedPlan = location.state?.plan || "Selected Plan";

//   return (
//     <PageWrapper>
//        <div className="pt-32 pb-20 px-6 md:px-8 max-w-3xl mx-auto min-h-screen text-white">
//           <RevealOnScroll>
//             <div className="text-center mb-12">
//               <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-4">Complete your order</h1>
//               <p className="text-zinc-500">You are purchasing the <span className="text-white font-bold">{selectedPlan}</span>.</p>
//             </div>
//           </RevealOnScroll>

//           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
//             <form className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">First Name</label>
//                   <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition" placeholder="John" />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Last Name</label>
//                   <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition" placeholder="Doe" />
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Work Email</label>
//                 <input type="email" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition" placeholder="john@company.com" />
//               </div>

//               <div>
//                 <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Company Name</label>
//                 <input type="text" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition" placeholder="Acme Inc." />
//               </div>

//               <div className="pt-6 border-t border-white/10">
//                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Payment Details</label>
//                  <div className="bg-black/50 border border-white/10 rounded-xl p-4 flex items-center gap-4">
//                     <div className="w-8 h-5 bg-zinc-700 rounded flex-shrink-0"></div>
//                     <input type="text" className="bg-transparent border-none w-full text-white focus:outline-none placeholder-zinc-600" placeholder="Card number" />
//                  </div>
//                  <div className="grid grid-cols-2 gap-6 mt-4">
//                     <input type="text" className="bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition" placeholder="MM / YY" />
//                     <input type="text" className="bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition" placeholder="CVC" />
//                  </div>
//               </div>

//               <button type="button" className="w-full bg-red-600 text-white py-5 rounded-full font-black uppercase tracking-widest text-sm shadow-lg shadow-red-600/20 hover:bg-red-700 transition transform active:scale-95 mt-6">
//                 Pay & Start Hiring
//               </button>

//               <p className="text-center text-[10px] text-zinc-600 uppercase font-bold tracking-widest mt-4">
//                 Secure 256-bit SSL Encrypted Payment
//               </p>
//             </form>
//           </motion.div>
//        </div>
//     </PageWrapper>
//   );
// };

// const ScrollToTop = () => {
//   const { pathname } = useLocation();
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [pathname]);
//   return null;
// };

// // --- APP CONTENT ---
// function AppContent() {
//   const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);
//   const location = useLocation();

//   return (
//     <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white font-sans overflow-x-hidden">
//       <ScrollToTop />
//       <Navbar onOpenGetStarted={() => setIsGetStartedOpen(true)} />
//       <GetStartedModal isOpen={isGetStartedOpen} onClose={() => setIsGetStartedOpen(false)} />
      
//       <AnimatePresence mode="wait">
//         <Routes location={location} key={location.pathname}>
//           <Route path="/" element={<Home />} />
//           <Route path="/services" element={<ServicesPage />} />
//           <Route path="/agents" element={<AgentsPage />} />
//           <Route path="/pricing" element={<PricingPage />} />
//           <Route path="/about" element={<AboutPage />} />
//           <Route path="/faq" element={<FAQPage />} />
//           <Route path="/contact" element={<ContactPage />} />
//           <Route path="/checkout" element={<CheckoutPage />} />
//           {/* New Service Routes */}
//           <Route path="/crm" element={<CRMPage />} />
//           <Route path="/website-management" element={<WebsiteManagementPage />} />
//         </Routes>
//       </AnimatePresence>
//     </div>
//   );
// }

// // --- MAIN APP COMPONENT ---
// export default function App() {
//   return (
//     <Router>
//       <AppContent />
//     </Router>
//   );
// }

import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
