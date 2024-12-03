'use client'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Settings, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium text-lg">Search Settings</h4>
              <p className="text-xs text-muted-foreground">
                Customize your search parameters
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-sm"
                >
                  Search Guide
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Different Search Types in Our System</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Reranking</h3>
                    <div className="space-y-2 pl-4">
                      <p><span className="font-medium">What it does:</span> A post-processing step that reorders search results using a more powerful (but slower) AI model</p>
                      <p><span className="font-medium">Benefits:</span></p>
                      <ul className="list-disc pl-6">
                        <li>More accurate ranking of results</li>
                        <li>Better understanding of nuanced queries</li>
                        <li>Improved handling of longer text comparisons</li>
                      </ul>
                      <p><span className="font-medium">Trade-offs:</span></p>
                      <ul className="list-disc pl-6">
                        <li>Slightly slower search response time</li>
                        <li>More computationally intensive</li>
                      </ul>
                      <p><span className="font-medium">When to use:</span> Enable when accuracy is more important than speed</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">1. Similarity Search</h3>
                    <div className="space-y-2 pl-4">
                      <p><span className="font-medium">What it does:</span> Pure AI-powered semantic search that finds matches based on meaning</p>
                      <div>
                        <p className="font-medium">Parameters:</p>
                        <ul className="list-disc pl-6">
                          <li>k: Number of results to return</li>
                        </ul>
                      </div>
                      <p><span className="font-medium">Best for:</span> Understanding natural language queries and finding contextually similar content</p>
                      <p><span className="font-medium">Example:</span> Searching "I'm feeling under the weather" will find documents about being sick, even if they don't use those exact words</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">2. Hybrid Search</h3>
                    <div className="space-y-2 pl-4">
                      <p><span className="font-medium">What it does:</span> Combines traditional keyword search with AI-powered semantic search</p>
                      <div>
                        <p className="font-medium">Parameters:</p>
                        <ul className="list-disc pl-6">
                          <li>full_text_weight (0.0-2.0): How much to value exact keyword matches</li>
                          <li>semantic_weight (0.0-2.0): How much to value meaning/context matches</li>
                          <li>rrf_k (default: 60): Technical parameter that affects how results are combined</li>
                        </ul>
                      </div>
                      <p><span className="font-medium">Best for:</span> General-purpose search where you want both exact matches and contextual understanding</p>
                      <p><span className="font-medium">Example:</span> When searching "car problems", it'll find both documents with those exact words AND documents about "automobile issues"</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">3. MMR (Maximum Marginal Relevance) Search</h3>
                    <div className="space-y-2 pl-4">
                      <p><span className="font-medium">What it does:</span> Finds relevant results while ensuring diversity (avoiding too-similar results)</p>
                      <div>
                        <p className="font-medium">Parameters:</p>
                        <ul className="list-disc pl-6">
                          <li>lambda_mult (0.0-1.0): Balance between relevance and diversity
                            <ul className="list-disc pl-6">
                              <li>Higher values (like 0.8): More relevant but possibly similar results</li>
                              <li>Lower values (like 0.3): More diverse but possibly less relevant results</li>
                            </ul>
                          </li>
                          <li>fetch_k: How many initial candidates to consider before diversifying</li>
                        </ul>
                      </div>
                      <p><span className="font-medium">Best for:</span> When you want to avoid repetitive results and get a broader perspective</p>
                      <p><span className="font-medium">Example:</span> Searching for "healthy food" - instead of getting 5 similar articles about salads, you'll get mix of different healthy food topics</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">4. Threshold Search</h3>
                    <div className="space-y-2 pl-4">
                      <p><span className="font-medium">What it does:</span> Only returns results that meet a minimum similarity score</p>
                      <div>
                        <p className="font-medium">Parameters:</p>
                        <ul className="list-disc pl-6">
                          <li>similarity_threshold (0.0-1.0): Minimum match quality required
                            <ul className="list-disc pl-6">
                              <li>Higher values (like 0.8): Only very close matches</li>
                              <li>Lower values (like 0.3): More lenient matching</li>
                            </ul>
                          </li>
                        </ul>
                      </div>
                      <p><span className="font-medium">Best for:</span> When you need high-quality matches and prefer no results over poor matches</p>
                      <p><span className="font-medium">Example:</span> In a technical support system where you only want to show solutions that are very likely to be relevant</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">When to Use Each:</h3>
                    <div className="space-y-4 pl-4">
                      <div>
                        <p className="font-medium">Use Similarity Search when:</p>
                        <ul className="list-disc pl-6">
                          <li>You want pure semantic understanding</li>
                          <li>Your users write natural language queries</li>
                          <li>Exact keyword matching isn't important</li>
                          <li>You're dealing with concepts that can be expressed in many different ways</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium">Use Hybrid Search when:</p>
                        <ul className="list-disc pl-6">
                          <li>You want a balanced, general-purpose search</li>
                          <li>Your users might search using either keywords or natural language</li>
                          <li>You want the best of both traditional and AI search</li>
                          <li>You need to handle both exact matches and conceptual matches</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium">Use MMR Search when:</p>
                        <ul className="list-disc pl-6">
                          <li>You want to avoid redundant results</li>
                          <li>You're building a research tool where diversity of perspective matters</li>
                          <li>You want to ensure users see a range of different options</li>
                          <li>You need to cover a topic broadly rather than deeply</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium">Use Threshold Search when:</p>
                        <ul className="list-disc pl-6">
                          <li>Quality of matches is more important than quantity</li>
                          <li>You're building something where wrong answers could be problematic</li>
                          <li>You want to be confident in the relevance of every result</li>
                          <li>You need to maintain a minimum standard of relevance</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Typical Use Cases:</h3>
                    <ul className="list-disc pl-6">
                      <li>Documentation/Knowledge Base: Hybrid Search (balance of exact and semantic matching)</li>
                      <li>Research Tools: MMR Search (diverse perspectives)</li>
                      <li>Technical Support: Threshold Search (high-quality matches only)</li>
                      <li>Conversational AI: Similarity Search (understanding natural language)</li>
                    </ul>
                  </div>

                  <p className="text-sm text-muted-foreground mt-6">Default values are set to work well for most cases, but you can adjust them based on your specific needs.</p>
                </div>
              </DialogContent>
            </Dialog>
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

