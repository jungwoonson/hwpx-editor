import type { HwpxDocument } from '../../lib/model';
import { StyleProvider } from './StyleContext';
import { ImageProvider } from './ImageContext';
import { PageView } from './PageView';

export function DocumentViewer({ document }: { document: HwpxDocument }) {
  return (
    <StyleProvider store={document.styles}>
      <ImageProvider images={document.images}>
        <div style={{ padding: '16px', backgroundColor: '#e5e7eb', minHeight: '100%' }}>
          {document.sections.map((section, i) => (
            <PageView key={i} section={section} />
          ))}
        </div>
      </ImageProvider>
    </StyleProvider>
  );
}
