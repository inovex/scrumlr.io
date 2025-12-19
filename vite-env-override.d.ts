declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGElement>>
  export default content
}

/* not needed?
declare module "*.png" {
  const content: string;
  export default content;
}
 */
