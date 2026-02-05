import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'About', href: '/about' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Contact', href: '/contact' }
  ];

  const socialLinks = [
    { name: 'Twitter', icon: '🐦', href: '#' },
    { name: 'Instagram', icon: '📷', href: '#' },
    { name: 'YouTube', icon: '📺', href: '#' }
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">K</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">K-Flow</h3>
                <p className="text-gray-400 text-sm">Korean Learning Platform</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Master Korean through K-dramas, gamified quizzes, and personalized learning paths. 
              Your journey to fluency starts here.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  aria-label={social.name}
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/level-assessment" className="text-gray-300 hover:text-white transition-colors">
                  Level Assessment
                </Link>
              </li>
              <li>
                <Link href="/vocabulary-quiz" className="text-gray-300 hover:text-white transition-colors">
                  Vocabulary Quiz
                </Link>
              </li>
              <li>
                <Link href="/drama-practice" className="text-gray-300 hover:text-white transition-colors">
                  Drama Practice
                </Link>
              </li>
              <li>
                <Link href="/achievements" className="text-gray-300 hover:text-white transition-colors">
                  Achievements
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} K-Flow. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Made with ❤️ for Korean learners worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
