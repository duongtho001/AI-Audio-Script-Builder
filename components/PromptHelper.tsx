import React from 'react';
import type { TranslationKeys } from '../translations';

interface PromptHelperProps {
  onInsertTag: (tag: string) => void;
  t: TranslationKeys;
}

const PromptHelper: React.FC<PromptHelperProps> = ({ onInsertTag, t }) => {
  const tagGroups = t.promptHelperTags;

  return (
    <div className="mt-2 p-3 bg-[#0D0D0F] border border-gray-600 rounded-lg text-xs space-y-3">
      <h4 className="font-semibold text-gray-400">{t.promptHelperTitle}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-3">
        {Object.keys(tagGroups).map(key => {
          const { group, tags } = tagGroups[key];
          return (
            <div key={group} className="flex flex-col">
              <p className="text-gray-400 font-semibold mb-1 truncate text-sm" title={group}>{group}</p>
              <div className="flex flex-col gap-1">
                {tags.map(({ tag, desc }: { tag: string, desc: string }) => (
                  <button
                    key={tag}
                    title={desc}
                    onClick={() => onInsertTag(`${tag}, `)}
                    className="text-left bg-gray-800/60 text-gray-300 px-2 py-1 rounded hover:bg-cyan-800/70 hover:text-cyan-200 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PromptHelper;