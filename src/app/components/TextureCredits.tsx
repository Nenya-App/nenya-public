/** The credit for the Touch gateway's surface pictures and the measurements made from them, shown on the page (each surface also carries its own credit and a link to its original in the picker). */
export function TextureCredits() {
  const link = 'underline underline-offset-2';
  return (
    <p className="mx-auto max-w-2xl text-center text-xs text-muted-foreground">
      The surface pictures are photographed material textures from{' '}
      <a href="https://ambientcg.com" target="_blank" rel="noopener noreferrer" className={link}>ambientCG</a> and{' '}
      <a href="https://polyhaven.com" target="_blank" rel="noopener noreferrer" className={link}>Poly Haven</a>, shared by them under CC0 (public domain). We credit them anyway: each surface links to its original in the picker. The “feel” labels are ours, measured from each surface’s published relief map; they describe bumpiness only.{' '}
      <a href="https://github.com/Nenya-App/nenya-public/blob/main/ATTRIBUTIONS.md" target="_blank" rel="noopener noreferrer" className={link}>All credits</a>.
    </p>
  );
}
