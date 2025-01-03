import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Dialog from './flowBox';


const SparkleButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <motion.button
        className="relative w-16 h-16 rounded-full overflow-hidden group"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsDialogOpen(!isDialogOpen)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-800 to-black transition-all duration-300 group-hover:scale-110 rounded-full" />

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <div className="absolute top-2 left-2">
            <Sparkles className="w-4 h-4 text-white animate-ping" />
          </div>
          <div className="absolute bottom-2 right-2">
            <Sparkles className="w-4 h-4 text-white animate-bounce" />
          </div>
        </motion.div>

        <div className="relative flex items-center justify-center text-white">
          <Sparkles className="w-6 h-6" />
        </div>
      </motion.button>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      >
      </Dialog>
    </div>
  );
};

export default SparkleButton;
