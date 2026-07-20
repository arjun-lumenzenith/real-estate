# Debounced API Implementation - Search and Footer Updates

## Overview
Updated the search section and footer to invoke the backend API when users select filter options, with intelligent debouncing to prevent server overload.

## Changes Made

### 1. Search Section Component (`components/search-section.tsx`)

#### Added Debouncing Logic
- **Import**: Added `useRef` to React imports for managing debounce timers
- **State**: Added `debounceTimerRef` to track active debounce timers
- **useEffect Hook**: Added new effect that watches `locs`, `buds`, `bhks` state changes

#### How It Works
```typescript
// Auto-fetch when filters change (with 2-second debounce)
useEffect(() => {
  if (debounceTimerRef.current) {
    clearTimeout(debounceTimerRef.current)
  }

  debounceTimerRef.current = setTimeout(() => {
    if (locs.length > 0 || buds.length > 0 || bhks.length > 0) {
      fetchProperties()
    }
  }, 2000)

  return () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
  }
}, [locs, buds, bhks])
```

#### Benefits
1. **Prevents Server Overload**: Only makes API call after user stops selecting options for 2 seconds
2. **User-Friendly**: Allows selecting multiple filters before API invocation
3. **Efficient**: Clears previous timers when new filters are selected
4. **Cleanup**: Proper cleanup on component unmount

### 2. Footer Component (`components/footer.tsx`)

#### Updated handleLocalityClick Function
- Made function `async` to handle API calls
- Added API call when locality is clicked
- Builds query parameters including the selected locality
- Adds 300ms delay before scrolling to allow API to settle

#### Implementation
```typescript
const handleLocalityClick = async (e: React.MouseEvent, localityName: string) => {
  e.preventDefault();
  
  if (setLocs) {
    // Add locality to filter
    if (!locs.includes(localityName)) {
      setLocs([...locs, localityName]);
    }
    
    // Trigger API call
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '20',
        locality: locs.includes(localityName) ? locs.join(',') : [...locs, localityName].join(','),
      });
      
      await fetch(`/api/properties?${params}`);
    } catch (error) {
      console.error('[Footer] API call failed:', error);
    }
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('property-grid')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }
};
```

## User Flow

### Search Section Filters
1. User checks "Whitefield" in locality dropdown
2. Dropdown closes automatically
3. 2-second timer starts (debounce)
4. If user checks "Sarjapur Road" within 2 seconds, timer resets
5. After 2 seconds of no new selections, API is called with both localities
6. Results update based on API response
7. Active filter badges show selected options

### Footer Locality Links
1. User clicks "Whitefield" in footer
2. Locality is added to filters
3. API is immediately called (no debounce)
4. Page scrolls smoothly to property grid
5. Results update from API

## API Parameters

### Query String Parameters
```
GET /api/properties?page=1&limit=20&locality=Whitefield,Sarjapur%20Road&minBudget=1000000&maxBudget=5000000&bhkType=2,3
```

- `page`: Pagination page number
- `limit`: Results per page
- `locality`: Comma-separated list of selected localities
- `minBudget`: Minimum price in rupees
- `maxBudget`: Maximum price in rupees  
- `bhkType`: Comma-separated BHK types (1, 2, 3, 4, etc.)

## Performance Considerations

1. **Debounce Delay**: 2 seconds allows users to select multiple options without overwhelming the API
2. **Cancellation**: Previous debounce timers are cancelled when new selections are made
3. **Cleanup**: useEffect cleanup prevents timer leaks on unmount
4. **Footer Direct Call**: Footer uses immediate API call (no debounce) since clicks are intentional user actions

## Testing

1. Select multiple filter options in search section - wait 2 seconds, API should be called once
2. Click footer locality link - API should be called immediately
3. Check browser network tab to verify API calls and parameters
4. Verify results update after API response
5. Check console for any error messages

## Dependencies
- No new external dependencies added
- Uses existing `useRef` and `useEffect` React hooks
- Leverages existing `fetchProperties()` function
- Compatible with current API structure
