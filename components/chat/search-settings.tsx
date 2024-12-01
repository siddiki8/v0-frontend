'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Settings } from 'lucide-react'
import { SearchOptions } from '@/types/api'

export function SearchSettings() {
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    search_type: 'SIMILARITY',
    k: 4,
    fetch_k: 20,
    lambda_mult: 0.5,
    rerank: false,
    alpha: 0.5,
  })
  const [dataset, setDataset] = useState<string>('finance')

  const handleSearchTypeChange = (value: 'SIMILARITY' | 'HYBRID' | 'MMR') => {
    setSearchOptions(prev => ({ ...prev, search_type: value }))
  }

  const handleSliderChange = (key: keyof SearchOptions, value: number[]) => {
    setSearchOptions(prev => ({ ...prev, [key]: value[0] }))
  }

  const handleRerankToggle = (checked: boolean) => {
    setSearchOptions(prev => ({ ...prev, rerank: checked }))
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
                  <RadioGroupItem value="SIMILARITY" id="similarity" />
                  <Label htmlFor="similarity">Similarity</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="HYBRID" id="hybrid" />
                  <Label htmlFor="hybrid">Hybrid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MMR" id="mmr" />
                  <Label htmlFor="mmr">MMR</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="k">Number of chunks (k)</Label>
              <Slider
                id="k"
                min={1}
                max={10}
                step={1}
                value={[searchOptions.k || 4]}
                onValueChange={(value) => handleSliderChange('k', value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">{searchOptions.k}</p>
            </div>

            {searchOptions.search_type === 'HYBRID' && (
              <div className="space-y-2">
                <Label htmlFor="alpha">Alpha (Hybrid weight)</Label>
                <Slider
                  id="alpha"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[searchOptions.alpha || 0.5]}
                  onValueChange={(value) => handleSliderChange('alpha', value)}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">{searchOptions.alpha?.toFixed(1)}</p>
              </div>
            )}

            {searchOptions.search_type === 'MMR' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fetch_k">Fetch K</Label>
                  <Slider
                    id="fetch_k"
                    min={1}
                    max={50}
                    step={1}
                    value={[searchOptions.fetch_k || 20]}
                    onValueChange={(value) => handleSliderChange('fetch_k', value)}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">{searchOptions.fetch_k}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lambda_mult">Lambda Multiplier</Label>
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
              </>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="rerank">Rerank</Label>
              <Switch
                id="rerank"
                checked={searchOptions.rerank}
                onCheckedChange={handleRerankToggle}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataset">Dataset</Label>
              <Select value={dataset} onValueChange={setDataset}>
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

