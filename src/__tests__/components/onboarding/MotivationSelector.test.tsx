import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MotivationSelector from '@/components/onboarding/MotivationSelector';
import { TRAVEL_MOTIVATIONS } from '@/lib/constants/onboarding';

jest.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (result: unknown) => void }) => (
    <div data-testid="drag-drop-context" onDragEnd={onDragEnd}>
      {children}
    </div>
  ),
  Droppable: ({ children }: { children: (provided: unknown, snapshot: unknown) => React.ReactNode }) => (
    <div data-testid="droppable">
      {children({ 
        droppableProps: {}, 
        innerRef: jest.fn(),
        placeholder: null 
      }, { isDraggingOver: false })}
    </div>
  ),
  Draggable: ({ children, draggableId }: { children: (provided: unknown, snapshot: unknown) => React.ReactNode; draggableId: string }) => (
    <div data-testid={`draggable-${draggableId}`}>
      {children({
        innerRef: jest.fn(),
        draggableProps: {},
        dragHandleProps: { 'data-testid': `drag-handle-${draggableId}` }
      }, { isDragging: false })}
    </div>
  ),
}));

const mockOnUpdate = jest.fn();

const defaultProps = {
  selectedMotivations: [],
  onUpdate: mockOnUpdate,
};

describe('MotivationSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all available motivations when none are selected', () => {
    render(<MotivationSelector {...defaultProps} />);

    Object.values(TRAVEL_MOTIVATIONS).forEach((motivation) => {
      expect(screen.getByText(motivation.label)).toBeInTheDocument();
      expect(screen.getByText(motivation.description)).toBeInTheDocument();
    });
  });

  it('should display selected motivations count', () => {
    render(<MotivationSelector {...defaultProps} />);
    
    expect(screen.getByText('Selected: 0 motivations')).toBeInTheDocument();
  });

  it('should update count when motivations are selected', () => {
    render(
      <MotivationSelector 
        selectedMotivations={['weather', 'budget']} 
        onUpdate={mockOnUpdate} 
      />
    );
    
    expect(screen.getByText('Selected: 2 motivations')).toBeInTheDocument();
  });

  it('should use singular form for single motivation', () => {
    render(
      <MotivationSelector 
        selectedMotivations={['weather']} 
        onUpdate={mockOnUpdate} 
      />
    );
    
    expect(screen.getByText('Selected: 1 motivation')).toBeInTheDocument();
  });

  it('should call onUpdate when motivation is clicked', async () => {
    const user = userEvent.setup();
    render(<MotivationSelector {...defaultProps} />);

    const weatherButton = screen.getByText(TRAVEL_MOTIVATIONS.weather_sun.label);
    await user.click(weatherButton);

    expect(mockOnUpdate).toHaveBeenCalledWith(['weather_sun']);
  });

  it('should remove motivation when already selected', async () => {
    const user = userEvent.setup();
    render(
      <MotivationSelector 
        selectedMotivations={['weather_sun', 'budget']} 
        onUpdate={mockOnUpdate} 
      />
    );

    const removeButton = screen.getByText('×');
    await user.click(removeButton);

    expect(mockOnUpdate).toHaveBeenCalledWith(['budget']);
  });

  it('should not show selected motivations in the selection grid', () => {
    render(
      <MotivationSelector 
        selectedMotivations={['weather_sun']} 
        onUpdate={mockOnUpdate} 
      />
    );

    const motivationCards = screen.getAllByRole('button');
    const weatherCardExists = motivationCards.some(card => 
      card.textContent?.includes(TRAVEL_MOTIVATIONS.weather_sun.label)
    );

    expect(weatherCardExists).toBe(false);
  });

  it('should show selected motivations in ranked list', () => {
    render(
      <MotivationSelector 
        selectedMotivations={['weather_sun', 'budget']} 
        onUpdate={mockOnUpdate} 
      />
    );

    expect(screen.getByText('Your Travel Priorities (drag to reorder)')).toBeInTheDocument();
    expect(screen.getByTestId('draggable-weather_sun')).toBeInTheDocument();
    expect(screen.getByTestId('draggable-budget')).toBeInTheDocument();
  });

  it('should display ranking numbers for selected motivations', () => {
    render(
      <MotivationSelector 
        selectedMotivations={['weather_sun', 'budget']} 
        onUpdate={mockOnUpdate} 
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should show drag handles for selected motivations', () => {
    render(
      <MotivationSelector 
        selectedMotivations={['weather_sun']} 
        onUpdate={mockOnUpdate} 
      />
    );

    expect(screen.getByTestId('drag-handle-weather_sun')).toBeInTheDocument();
  });

  it('should show helpful instruction text', () => {
    render(<MotivationSelector {...defaultProps} />);

    expect(screen.getByText('Select what motivates your GAA travel - then drag to rank by importance!')).toBeInTheDocument();
  });

  it('should show priority weighting tip when motivations are selected', () => {
    render(
      <MotivationSelector 
        selectedMotivations={['weather_sun']} 
        onUpdate={mockOnUpdate} 
      />
    );

    expect(screen.getByText('💡 Your #1 priority will be weighted most heavily in recommendations')).toBeInTheDocument();
  });

  it('should handle drag end event', () => {
    const { container } = render(
      <MotivationSelector 
        selectedMotivations={['weather_sun', 'budget', 'culture']} 
        onUpdate={mockOnUpdate} 
      />
    );

    const dragDropContext = container.querySelector('[data-testid="drag-drop-context"]');
    
    const mockDragResult = {
      source: { index: 0 },
      destination: { index: 2 },
      draggableId: 'weather_sun'
    };

    fireEvent.dragEnd(dragDropContext!, { detail: mockDragResult });

    expect(mockOnUpdate).toHaveBeenCalledWith(['budget', 'culture', 'weather_sun']);
  });

  it('should not update when drag has no destination', () => {
    const { container } = render(
      <MotivationSelector 
        selectedMotivations={['weather_sun', 'budget']} 
        onUpdate={mockOnUpdate} 
      />
    );

    const dragDropContext = container.querySelector('[data-testid="drag-drop-context"]');
    
    const mockDragResult = {
      source: { index: 0 },
      destination: null,
      draggableId: 'weather_sun'
    };

    fireEvent.dragEnd(dragDropContext!, { detail: mockDragResult });

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('should render motivation icons and descriptions', () => {
    render(<MotivationSelector {...defaultProps} />);

    Object.values(TRAVEL_MOTIVATIONS).forEach((motivation) => {
      expect(screen.getByText(motivation.icon)).toBeInTheDocument();
      expect(screen.getByText(motivation.description)).toBeInTheDocument();
    });
  });

  it('should handle empty selected motivations gracefully', () => {
    render(<MotivationSelector {...defaultProps} />);

    expect(screen.queryByText('Your Travel Priorities (drag to reorder)')).not.toBeInTheDocument();
    expect(screen.getByText('Selected: 0 motivations')).toBeInTheDocument();
  });

  it('should maintain motivation order in ranked list', () => {
    render(
      <MotivationSelector 
        selectedMotivations={['culture', 'weather_sun', 'budget']} 
        onUpdate={mockOnUpdate} 
      />
    );

    const rankedItems = screen.getAllByTestId(/^draggable-/);
    expect(rankedItems[0]).toHaveAttribute('data-testid', 'draggable-culture');
    expect(rankedItems[1]).toHaveAttribute('data-testid', 'draggable-weather_sun');
    expect(rankedItems[2]).toHaveAttribute('data-testid', 'draggable-budget');
  });
});