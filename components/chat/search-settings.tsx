'use client'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Settings } from 'lucide-react'

// Dataset mapping
export const DATASET_MAP = {
  finance: 'finance-dataset',
  law: 'law-dataset',
  biology: 'biology-dataset'
} as const;

export type DatasetDisplayName = keyof typeof DATASET_MAP;
export type DatasetId = typeof DATASET_MAP[DatasetDisplayName];

export interface SearchOptions {
  search_type: "hybrid" | "similarity" | "mmr" | "threshold";
  k: number;
  rerank?: boolean;
  // Hybrid search options
  full_text_weight?: number;
  semantic_weight?: number;
  rrf_k?: number;
  // MMR search options
  lambda_mult?: number;
  fetch_k?: number;
  // Threshold search options
  similarity_threshold?: number;
}

interface SearchSettingsProps {
  searchOptions: SearchOptions;
  onSearchOptionsChange: (options: SearchOptions) => void;
  dataset: DatasetDisplayName;
  onDatasetChange: (dataset: DatasetDisplayName) => void;
}

export function SearchSettings({ 
  searchOptions, 
  onSearchOptionsChange,
  dataset,
  onDatasetChange
}: SearchSettingsProps) {
  const handleSearchTypeChange = (value: "hybrid" | "similarity" | "mmr" | "threshold") => {
    const newOptions: SearchOptions = {
      ...searchOptions,
      search_type: value,
      k: value === 'threshold' ? 100 : searchOptions.k, // Default to max k for threshold
      rerank: searchOptions.rerank,
      // Reset type-specific options
      full_text_weight: value === 'hybrid' ? 1.0 : undefined,
      semantic_weight: value === 'hybrid' ? 1.0 : undefined,
      rrf_k: value === 'hybrid' ? 60 : undefined,
      lambda_mult: value === 'mmr' ? 0.5 : undefined,
      fetch_k: value === 'mmr' ? searchOptions.k * 2 : undefined,
      // Set threshold defaults
      similarity_threshold: value === 'threshold' ? 0.7 : undefined,
    }
    onSearchOptionsChange(newOptions)
  }

  const handleSliderChange = (key: keyof SearchOptions, value: number[]) => {
    onSearchOptionsChange({ ...searchOptions, [key]: value[0] })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Search settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="grid gap-6">
          <div className="space-y-2">
            <h4 className="font-medium text-lg">Search Settings</h4>
            <p className="text-sm text-muted-foreground">
              Customize your search parameters
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search_type">Search Type</Label>
              <RadioGroup
                id="search_type"
                value={searchOptions.search_type}
                onValueChange={handleSearchTypeChange}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="similarity" id="similarity" />
                  <Label htmlFor="similarity">Similarity</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hybrid" id="hybrid" />
                  <Label htmlFor="hybrid">Hybrid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mmr" id="mmr" />
                  <Label htmlFor="mmr">MMR</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="threshold" id="threshold" />
                  <Label htmlFor="threshold">Threshold</Label>
                </div>
              </RadioGroup>
            </div>

            {searchOptions.search_type !== 'threshold' && (
              <div className="flex items-center justify-between">
                <Label htmlFor="rerank">Rerank results</Label>
                <Switch
                  id="rerank"
                  checked={searchOptions.rerank}
                  onCheckedChange={(checked) => 
                    onSearchOptionsChange({ ...searchOptions, rerank: checked })
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="k">
                {searchOptions.search_type === 'threshold' 
                  ? 'Maximum results'
                  : searchOptions.rerank 
                    ? 'Number of results (k)' 
                    : 'Number of results'
                }
              </Label>
              <Slider
                id="k"
                min={1}
                max={searchOptions.search_type === 'threshold' ? 100 : 10}
                step={1}
                value={[searchOptions.k]}
                onValueChange={(value) => handleSliderChange('k', value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">{searchOptions.k}</p>
            </div>

            {searchOptions.search_type === 'hybrid' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="semantic_weight">Semantic Weight</Label>
                  <Slider
                    id="semantic_weight"
                    min={0}
                    max={2}
                    step={0.1}
                    value={[searchOptions.semantic_weight || 1.0]}
                    onValueChange={(value) => handleSliderChange('semantic_weight', value)}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">{searchOptions.semantic_weight?.toFixed(1)}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_text_weight">Full Text Weight</Label>
                  <Slider
                    id="full_text_weight"
                    min={0}
                    max={2}
                    step={0.1}
                    value={[searchOptions.full_text_weight || 1.0]}
                    onValueChange={(value) => handleSliderChange('full_text_weight', value)}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">{searchOptions.full_text_weight?.toFixed(1)}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rrf_k">RRF K</Label>
                  <Slider
                    id="rrf_k"
                    min={10}
                    max={100}
                    step={5}
                    value={[searchOptions.rrf_k || 60]}
                    onValueChange={(value) => handleSliderChange('rrf_k', value)}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">{searchOptions.rrf_k}</p>
                </div>
              </>
            )}

            {searchOptions.search_type === 'mmr' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="lambda_mult">Diversity vs. Relevance</Label>
                  <Slider
                    id="lambda_mult"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[searchOptions.lambda_mult || 0.5]}
                    onValueChange={(value) => handleSliderChange('lambda_mult', value)}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">{searchOptions.lambda_mult?.toFixed(1)}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fetch_k">Initial Pool Size</Label>
                  <Slider
                    id="fetch_k"
                    min={1}
                    max={20}
                    step={1}
                    value={[searchOptions.fetch_k || searchOptions.k * 2]}
                    onValueChange={(value) => handleSliderChange('fetch_k', value)}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">{searchOptions.fetch_k}</p>
                </div>
              </>
            )}

            {searchOptions.search_type === 'threshold' && (
              <div className="space-y-2">
                <Label htmlFor="similarity_threshold">Similarity Threshold</Label>
                <Slider
                  id="similarity_threshold"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[searchOptions.similarity_threshold || 0.7]}
                  onValueChange={(value) => handleSliderChange('similarity_threshold', value)}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">{searchOptions.similarity_threshold?.toFixed(2)}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="dataset">Dataset</Label>
              <Select value={dataset} onValueChange={onDatasetChange}>
                <SelectTrigger id="dataset">
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="law">Law</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

