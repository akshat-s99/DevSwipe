# Components Directory

This directory contains reusable React components for the DevSwipe application.

## Structure

```
components/
├── COMPONENT_TEMPLATE.jsx  # Template for creating new components
└── README.md               # This file
```

## Creating New Components

### Step 1: Copy the Template

```bash
cp COMPONENT_TEMPLATE.jsx MyNewComponent.jsx
```

### Step 2: Update Component Code

Replace `ComponentName` with your component name throughout the file:
- Function name
- Import statements
- CSS class names
- PropTypes definition

### Step 3: Create Corresponding CSS

Create a CSS file in `../styles/MyNewComponent.css`:

```css
.my-new-component-container {
  /* Your styles here */
}

.my-new-component-content {
  /* Your styles here */
}
```

### Step 4: Use in Your Pages

```jsx
import MyNewComponent from '../components/MyNewComponent';

export default function MyPage() {
  return (
    <MyNewComponent 
      prop1="value1"
      prop2="value2"
      onActionClick={() => console.log('Action clicked')}
    />
  );
}
```

## Best Practices

### 1. Props Definition

Always define PropTypes for better type checking:

```jsx
import PropTypes from 'prop-types';

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number,
  onClick: PropTypes.func,
  items: PropTypes.arrayOf(PropTypes.object)
};

MyComponent.defaultProps = {
  count: 0,
  onClick: () => {}
};
```

### 2. State Management

Use `useState` for component-level state:

```jsx
const [isOpen, setIsOpen] = useState(false);
const [data, setData] = useState(null);
```

For global state (like auth), use context from `../context/AuthContext.jsx`:

```jsx
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated } = useAuth();
  // Use auth data
};
```

### 3. Effects and Lifecycle

Use `useEffect` for side effects:

```jsx
// Run once on mount
useEffect(() => {
  initializeComponent();
  return () => cleanup();
}, []);

// Run when dependencies change
useEffect(() => {
  loadData(id);
}, [id]);
```

### 4. API Calls

Always use the Axios instance with proper error handling:

```jsx
import axiosInstance from '../api/axiosConfig';

const fetchData = async () => {
  try {
    setLoading(true);
    const response = await axiosInstance.get('/endpoint');
    setData(response.data);
  } catch (error) {
    setError(error.response?.data?.message || 'Error occurred');
  } finally {
    setLoading(false);
  }
};
```

### 5. Styling

- Use Bootstrap 5 classes for consistency
- Create component-specific CSS in `../styles/`
- Follow naming conventions: `.component-name-container`, `.component-name-content`
- Use CSS transitions for animations (no Framer Motion)

```css
.my-component {
  transition: all 0.3s ease;
}

.my-component:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
```

### 6. Accessibility

- Use semantic HTML elements
- Add ARIA labels where needed
- Ensure buttons are keyboard accessible
- Use meaningful alt text for images

```jsx
<button 
  className="btn btn-primary"
  aria-label="Close modal"
  onClick={handleClose}
>
  ×
</button>
```

### 7. Error Handling

Always include loading and error states:

```jsx
if (loading) {
  return <div className="loading">Loading...</div>;
}

if (error) {
  return <div className="alert alert-danger">{error}</div>;
}

return <div>{/* Your content */}</div>;
```

## Common Components to Create

Based on the DevSwipe feature set, consider creating:

### 1. ProfileCard
Display a user profile with image, name, bio, and skills.

**Props:**
- `profile` (object) - User profile data
- `onLike` (function) - Callback for like action
- `onPass` (function) - Callback for pass action

### 2. SkillBadge
Display a skill tag with styling.

**Props:**
- `skill` (string) - Skill name
- `onRemove` (function, optional) - Remove button callback

### 3. LoadingSpinner
Reusable loading spinner component.

**Props:**
- `message` (string, optional) - Loading message
- `size` (string) - 'small', 'medium', 'large'

### 4. ConfirmationModal
Reusable confirmation dialog.

**Props:**
- `title` (string) - Modal title
- `message` (string) - Confirmation message
- `onConfirm` (function) - Confirm callback
- `onCancel` (function) - Cancel callback

### 5. MessageBubble
Display individual chat message.

**Props:**
- `message` (object) - Message data
- `isOwn` (boolean) - Whether message is from current user

### 6. UserAvatar
Display user profile image with fallback.

**Props:**
- `src` (string) - Image URL
- `name` (string) - User name (for fallback)
- `size` (string) - Avatar size

## File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.jsx`)
- **Files**: Match component name (e.g., `UserProfile.jsx`)
- **CSS Files**: Match component name (e.g., `UserProfile.css`)
- **Folders**: camelCase for feature folders (e.g., `components/`)

## Imports

Always import from relative paths:

```jsx
// ✓ Correct
import AuthContext from '../context/AuthContext';
import axiosInstance from '../api/axiosConfig';
import '../styles/MyComponent.css';

// ✗ Incorrect
import AuthContext from 'context/AuthContext';
import axiosInstance from 'api/axiosConfig';
```

## Testing

Each component should have basic tests. Example:

```jsx
// MyComponent.test.jsx
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders with props', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('calls onClick when button is clicked', () => {
    const onClick = jest.fn();
    render(<MyComponent onClick={onClick} />);
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalled();
  });
});
```

## Performance Tips

1. **Memoize Components**: Use `React.memo()` for expensive renders
   ```jsx
   export default React.memo(MyComponent);
   ```

2. **Memoize Callbacks**: Use `useCallback()` for callbacks passed as props
   ```jsx
   const handleClick = useCallback(() => { /* ... */ }, [dependency]);
   ```

3. **Memoize Objects**: Use `useMemo()` for computed values
   ```jsx
   const memoizedData = useMemo(() => processData(data), [data]);
   ```

4. **Code Splitting**: Import heavy components lazily
   ```jsx
   const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
   ```

## Documentation Template

Add this comment block to your component file:

```jsx
/**
 * ComponentName
 * 
 * Description of what this component does.
 * 
 * @component
 * @example
 * const props = {
 *   prop1: 'value',
 *   prop2: () => console.log('clicked')
 * };
 * return <ComponentName {...props} />
 * 
 * @props {string} prop1 - Description
 * @props {function} prop2 - Description
 * 
 * @returns {JSX.Element} Rendered component
 */
```

## Troubleshooting

### Component Not Re-rendering
- Check if state is updated (not mutated directly)
- Verify dependency array in useEffect
- Check if props are changing

### Styles Not Applying
- Ensure CSS file is imported in component
- Check for CSS conflicts with Bootstrap
- Verify CSS class names match

### API Calls Not Working
- Check browser console for errors
- Verify token in localStorage
- Test endpoint with curl or Postman

### Memory Leaks
- Clean up subscriptions in useEffect return
- Cancel requests when component unmounts
- Remove event listeners

## Resources

- [React Documentation](https://react.dev)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.0)
- [Axios Documentation](https://axios-http.com)
- [React Hooks Documentation](https://react.dev/reference/react)
