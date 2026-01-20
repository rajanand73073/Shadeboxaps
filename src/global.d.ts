// declare module 'llamaai' {
//     const LlamaAI: any; // You can replace `any` with a more specific type if you want to improve type safety
//     export default LlamaAI;
//   }

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
