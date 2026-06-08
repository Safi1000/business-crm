import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { staggerContainer, staggerItem } from '../tokens/motion';
import { useReducedMotion } from './useReducedMotion';

type StaggerProps = Omit<HTMLMotionProps<'div'>, 'children'> & {
  stagger?: number;
  delayChildren?: number;
  children?: ReactNode;
};

/** Container that staggers the entrance of its <Stagger.Item> children. */
export function Stagger({ stagger = 0.045, delayChildren = 0.04, children, ...rest }: StaggerProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={reduced ? undefined : staggerContainer(stagger, delayChildren)}
      initial={reduced ? undefined : 'hidden'}
      animate={reduced ? undefined : 'show'}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

function Item({
  children,
  ...rest
}: Omit<HTMLMotionProps<'div'>, 'children'> & { children?: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div variants={reduced ? undefined : staggerItem} {...rest}>
      {children}
    </motion.div>
  );
}

Stagger.Item = Item;
