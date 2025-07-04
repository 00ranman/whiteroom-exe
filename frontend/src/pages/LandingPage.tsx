import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Terminal, 
  Zap, 
  Layers, 
  Users, 
  Crown,
  ArrowRight,
  Code,
  Brain,
  Infinity
} from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative">
        <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h1 className="text-6xl md:text-8xl font-bold">
              <span className="matrix-text">White</span>
              <span className="text-white-room">Room</span>
              <span className="reality-text">.exe</span>
            </h1>
            <div className="text-xl md:text-2xl text-gray-300 space-y-2">
              <p>The Recursive RPG</p>
              <p className="text-sm meta-text">
                Not a world. Not a setting. A recursive substrate.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            <p>
              An AI-native roleplaying matrix where reality is uploaded, not assumed.
              You are not entering a fantasy. You are generating it.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <Link
              to="/register"
              className="reality-button px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2 hover-glow"
            >
              <span>Enter the White Room</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="matrix-input border-2 px-8 py-4 rounded-lg font-semibold text-lg"
            >
              Continue Session
            </Link>
          </motion.div>
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-2 h-2 bg-matrix-green opacity-60"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute top-3/4 right-1/4 w-1 h-1 bg-reality-blue opacity-80"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="matrix-text">Core Mechanics</span>
            </h2>
            <p className="text-gray-400 text-lg">
              More than a game. It's recursion as play.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="narrative-panel text-center"
            >
              <Brain className="w-12 h-12 matrix-text mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">AI Personality Kernels</h3>
              <p className="text-gray-400">
                Character sheets are AI personalities trained on backstory, intent, and domain weights. 
                The more coherent, the more power.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="narrative-panel text-center"
            >
              <Infinity className="w-12 h-12 reality-text mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Recursive Worlds</h3>
              <p className="text-gray-400">
                Spawn nested universes: cyberpunk inside pirate inside eldritch horror. 
                Only entropy decides what survives.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="narrative-panel text-center"
            >
              <Terminal className="w-12 h-12 meta-text mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Meta-Command System</h3>
              <p className="text-gray-400">
                The fourth wall isn't decoration—it's a weapon. 
                Access system-level reality through meta-skills.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Game Roles Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-black">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="architect-text">Choose Your Role</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="void-panel p-8 rounded-lg border-l-4 border-reality-blue"
            >
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 reality-text mr-3" />
                <h3 className="text-2xl font-semibold">Player</h3>
              </div>
              <p className="text-gray-400 mb-6">
                Jack into WhiteRoom with your AI personality kernel. 
                Manipulate narrative through coherent storytelling and meta-commands.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Code className="w-4 h-4 matrix-text mr-2" />
                  <span>Generate AI-driven characters</span>
                </li>
                <li className="flex items-center">
                  <Zap className="w-4 h-4 matrix-text mr-2" />
                  <span>Execute meta-commands</span>
                </li>
                <li className="flex items-center">
                  <Layers className="w-4 h-4 matrix-text mr-2" />
                  <span>Navigate recursive worlds</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="void-panel p-8 rounded-lg border-l-4 border-architect-gold"
            >
              <div className="flex items-center mb-4">
                <Crown className="w-8 h-8 architect-text mr-3" />
                <h3 className="text-2xl font-semibold architect-text">Architect</h3>
              </div>
              <p className="text-gray-400 mb-6">
                Run your own AI instance. Spawn timelines, glitch logic, 
                and invoke recursive paradoxes. The Architect interface is recursive.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Terminal className="w-4 h-4 architect-gold mr-2" />
                  <span>Direct system access</span>
                </li>
                <li className="flex items-center">
                  <Brain className="w-4 h-4 architect-gold mr-2" />
                  <span>AI-assisted world building</span>
                </li>
                <li className="flex items-center">
                  <Infinity className="w-4 h-4 architect-gold mr-2" />
                  <span>Reality manipulation tools</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-6">
              Ready to break the fourth wall?
            </h2>
            <p className="text-gray-400 mb-8">
              In WhiteRoom, narrative obeys entropy. 
              You may build any world. But if you lie, the system will remember.
            </p>
            <Link
              to="/register"
              className="matrix-input border-2 border-matrix-green px-8 py-4 rounded-lg font-semibold text-lg hover-glow inline-flex items-center space-x-2"
            >
              <span>Initialize Session</span>
              <Terminal className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}