We are building ai assisted task management system, which has following feateures - 
Create a Requirements Management System with AI Integration

SYSTEM REQUIREMENTS:
Create a modern web application using Next.js 14+, TypeScript, and Tailwind CSS for managing software requirements with AI assistance.

CORE FEATURES:

1. Hierarchical Item Structure:
- Epic > User Stories > Tasks > Test Scenarios
- Each level must maintain parent-child relationships
- Implement drag-and-drop functionality for easy reorganization
- If a requirement is added, Epic, User Stories, Tasks and Test Scenarios are automatically generated

2. Item Components:
- Common fields: title, description, status, priority, created/modified dates
- Custom fields based on item type
- Each field should be editable inline
- AI assistance button (🤖) next to each field for smart suggestions
- Validation rules for required fields
- Allow Users to group requirements and epic under folders

3. Views:
- Tree view (left sidebar, collapsible)
- Kanban board view
- List view with filtering/sorting
- Timeline view

4. AI Integration:
- Auto-generate child items from parent descriptions
- Smart field suggestions
- Requirements analysis and validation
- Automatic test scenario generation

5. Audit System:
- Track all changes (create, update, delete)
- Log user, timestamp, and specific changes
- Dashboard with activity graphs
- Filterable audit log table

TECHNICAL SPECIFICATIONS:

1. Frontend:
- Responsive design (mobile-first approach)
- Dark/light theme support
- Keyboard shortcuts for common actions
- Loading states and error handling

2. Data Management:
- JSON export/import functionality
- Local storage backup
- API integration for AI services
- Real-time updates

3. UI Components:
- Custom modals for item creation/editing
- Toast notifications for actions
- Progress indicators for AI operations
- Responsive navigation menu

4. Performance:
- Implement virtualization for large datasets
- Optimize AI API calls
- Cache frequently used data

ACCESSIBILITY:
- ARIA labels
- Keyboard navigation
- High contrast support
- Screen reader compatibility