import React, { useState, useEffect } from 'react';
import { Icons } from '@onlook/ui/icons';
import { Illustrations } from '../../landing-page/illustrations';

function DraggableElement({
    elementId,
    selectedElement,
    setSelectedElement,
    draggedElement,
    setDraggedElement,
    dragOffset,
    setDragOffset,
    children,
    style = {},
    outlineColor = 'red',
    initialSize = { width: 100, height: 100 },
    animationTime = 0,
    ...rest
}: {
    elementId: string,
    selectedElement: string | null,
    setSelectedElement: (id: string) => void,
    draggedElement: string | null,
    setDraggedElement: (id: string | null) => void,
    dragOffset: { x: number, y: number },
    setDragOffset: (offset: { x: number, y: number }) => void,
    children: React.ReactNode,
    style?: React.CSSProperties,
    outlineColor?: string,
    initialSize?: { width: number, height: number },
    animationTime?: number,
    [key: string]: any
}) {
    const isSelected = selectedElement === elementId;
    const [size, setSize] = React.useState<{ width: number; height: number }>({ 
        width: initialSize.width, 
        height: initialSize.height 
    });
    const [isResizing, setIsResizing] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    type ResizeOrigin = {
        mouseX: number;
        mouseY: number;
        width: number;
        height: number;
        left: number;
        top: number;
        corner: Corner;
    } | null;
    const [resizeOrigin, setResizeOrigin] = React.useState<ResizeOrigin>(null);
    const elementRef = React.useRef<HTMLDivElement>(null);
    const aspectRatioRef = React.useRef(1);

    React.useEffect(() => {
        if (elementRef.current) {
            aspectRatioRef.current = initialSize.width / initialSize.height;
        }
    }, [initialSize.width, initialSize.height]);

    const handleResizeMouseDown = (corner: Corner) => (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
        if (!elementRef.current) return;
        const rect = elementRef.current.getBoundingClientRect();
        setIsResizing(true);
        setResizeOrigin({
            mouseX: e.clientX,
            mouseY: e.clientY,
            width: rect.width,
            height: rect.height,
            left: rect.left,
            top: rect.top,
            corner,
        });
        document.body.style.cursor =
            corner === 'top-left' || corner === 'bottom-right' ? 'nwse-resize' : 'nesw-resize';
    };

    React.useEffect(() => {
        if (!isResizing || !resizeOrigin) return;
        const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - resizeOrigin.mouseX;
            const dy = e.clientY - resizeOrigin.mouseY;
            let scaleDelta;
            if (
                resizeOrigin.corner === 'top-left' || resizeOrigin.corner === 'bottom-right'
            ) {
                scaleDelta = Math.max(dx, dy);
            } else {
                scaleDelta = Math.max(-dx, dy);
            }
            let newWidth = Math.max(24, resizeOrigin.width + scaleDelta);
            let newHeight = Math.max(24, newWidth / aspectRatioRef.current);
            setSize({ width: newWidth, height: newHeight });
        };
        const handleMouseUp = () => {
            setIsResizing(false);
            setResizeOrigin(null);
            document.body.style.cursor = '';
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, resizeOrigin]);

    return (
        <div
            ref={elementRef}
            className="absolute cursor-grab select-none draggable-text"
            data-element-id={elementId}
            style={{
                zIndex: isSelected ? 3 : isHovered ? 2 : 1,
                border: isHovered && !isSelected ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
                outline: isSelected ? `2px solid ${outlineColor}` : 'none',
                outlineOffset: '0px',
                borderRadius: '2px',
                padding: 0,
                minWidth: 0,
                minHeight: 0,
                width: size.width,
                height: size.height,
                transform: `${style.transform || ''} ${isHovered && !isSelected && draggedElement !== elementId ? 'scale(1.02)' : 'scale(1.0)'} ${
                    draggedElement !== elementId ? `translateY(${Math.sin(animationTime / 1500 + elementId.charCodeAt(0)) * 4}px)` : ''
                }`.trim(),
                transition: draggedElement === elementId ? 'none' : 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                boxShadow: isHovered ? '0 4px 12px rgba(239, 68, 68, 0.15)' : isSelected ? '0 2px 8px rgba(239, 68, 68, 0.2)' : 'none',
                filter: isHovered && !isSelected ? 'brightness(1.05)' : 'brightness(1.0)',
                ...style,
            }}
            onClick={() => setSelectedElement(elementId)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={(e) => {
                if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
                e.preventDefault();
                setDraggedElement(elementId);
                setSelectedElement(elementId);
                const element = e.currentTarget as HTMLDivElement;
                const rect = element.getBoundingClientRect();
                const canvasRect = (element.closest('.canvas-container') as HTMLDivElement).getBoundingClientRect();
                setDragOffset({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                });
                element.style.opacity = '0.9';
                element.style.cursor = 'grabbing';
            }}
            {...rest}
        >
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {children}
            </div>
            {(isSelected || isHovered) && (
                <>
                    <div
                        className="resize-handle"
                        style={{
                            position: 'absolute',
                            top: '-7px',
                            left: '-7px',
                            width: '12px',
                            height: '12px',
                            background: 'white',
                            border: '2px solid #ef4444',
                            borderRadius: '50%',
                            cursor: 'nwse-resize',
                            zIndex: 4,
                            opacity: isSelected ? 1 : isHovered ? 0.6 : 0,
                            transform: `scale(${isSelected ? 1 : isHovered ? 0.8 : 0})`,
                            transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        }}
                        onMouseDown={handleResizeMouseDown('top-left')}
                    />
                    <div
                        className="resize-handle"
                        style={{
                            position: 'absolute',
                            top: '-7px',
                            right: '-7px',
                            width: '12px',
                            height: '12px',
                            background: 'white',
                            border: '2px solid #ef4444',
                            borderRadius: '50%',
                            cursor: 'nesw-resize',
                            zIndex: 4,
                            opacity: isSelected ? 1 : isHovered ? 0.6 : 0,
                            transform: `scale(${isSelected ? 1 : isHovered ? 0.8 : 0})`,
                            transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        }}
                        onMouseDown={handleResizeMouseDown('top-right')}
                    />
                    <div
                        className="resize-handle"
                        style={{
                            position: 'absolute',
                            bottom: '-7px',
                            left: '-7px',
                            width: '12px',
                            height: '12px',
                            background: 'white',
                            border: '2px solid #ef4444',
                            borderRadius: '50%',
                            cursor: 'nesw-resize',
                            zIndex: 4,
                            opacity: isSelected ? 1 : isHovered ? 0.6 : 0,
                            transform: `scale(${isSelected ? 1 : isHovered ? 0.8 : 0})`,
                            transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        }}
                        onMouseDown={handleResizeMouseDown('bottom-left')}
                    />
                    <div
                        className="resize-handle"
                        style={{
                            position: 'absolute',
                            bottom: '-7px',
                            right: '-7px',
                            width: '12px',
                            height: '12px',
                            background: 'white',
                            border: '2px solid #ef4444',
                            borderRadius: '50%',
                            cursor: 'nwse-resize',
                            zIndex: 4,
                            opacity: isSelected ? 1 : isHovered ? 0.6 : 0,
                            transform: `scale(${isSelected ? 1 : isHovered ? 0.8 : 0})`,
                            transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        }}
                        onMouseDown={handleResizeMouseDown('bottom-right')}
                    />
                </>
            )}
        </div>
    );
}

export function DirectEditingInteractive() {
    const [selectedElement, setSelectedElement] = useState<string | null>('face1');
    const [draggedElement, setDraggedElement] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [animationTime, setAnimationTime] = useState(0);

    const handleMouseMove = (e: MouseEvent) => {
        if (!draggedElement) return;
        
        const canvas = document.querySelector('.canvas-container') as HTMLDivElement;
        const canvasRect = canvas.getBoundingClientRect();
        const element = document.querySelector(`[data-element-id="${draggedElement}"]`) as HTMLDivElement;
        
        if (!element) return;
        
        const newX = e.clientX - canvasRect.left - dragOffset.x;
        const newY = e.clientY - canvasRect.top - dragOffset.y;
        
        const maxX = canvasRect.width - element.offsetWidth;
        const maxY = canvasRect.height - element.offsetHeight;
        
        const constrainedX = Math.max(0, Math.min(newX, maxX));
        const constrainedY = Math.max(0, Math.min(newY, maxY));
        
        element.style.left = `${constrainedX}px`;
        element.style.top = `${constrainedY}px`;
        element.style.transform = 'none';
    };

    const handleMouseUp = () => {
        if (draggedElement) {
            const element = document.querySelector(`[data-element-id="${draggedElement}"]`) as HTMLDivElement;
            if (element) {
                element.style.opacity = '1';
                element.style.cursor = 'grab';
            }
            setDraggedElement(null);
        }
    };

    const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const canvasContainer = target.closest('.canvas-container');
        
        if (!canvasContainer && !target.closest('.draggable-text')) {
        }
    };

    // Animation loop for floating effect
    useEffect(() => {
        let animationFrame: number;
        const updateAnimation = () => {
            setAnimationTime(Date.now());
            animationFrame = requestAnimationFrame(updateAnimation);
        };
        animationFrame = requestAnimationFrame(updateAnimation);
        
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggedElement, dragOffset]);

    return (
        <div className="w-full h-100 bg-background-onlook/80 rounded-lg overflow-hidden">
            <div className="w-90 h-100 bg-[#0A484D] rounded-lg relative left-1/2 top-60 transform -translate-x-1/2 -translate-y-1/2 canvas-container text-[#F0EFE3]">
                <div className="w-full h-8 border-b border-[#F0EFE3]/50 px-2 flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center gap-1 select-none">
                        <Illustrations.VinoLogo className="w-4 h-4" />
                        <Illustrations.VinoWordmark className="w-12 h-12" />
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <Illustrations.VinoMenu className="w-4 h-4" />
                        <Illustrations.VinoContact className="w-12 h-12" />
                    </div>
                </div>
                <div className="w-full h-full flex flex-row items-top mt-8 justify-center">
                    <div className="w-fit h-fit">
                        <Illustrations.VinoHeadline className="w-50 h-fit" />
                    </div>
                    <div className="grid gap-2">
                        <DraggableElement
                            elementId="svg1"
                            selectedElement={selectedElement}
                            setSelectedElement={setSelectedElement}
                            draggedElement={draggedElement}
                            setDraggedElement={setDraggedElement}
                            dragOffset={dragOffset}
                            setDragOffset={setDragOffset}
                            animationTime={animationTime}
                            style={{ top: '170px', right: '6px', width: 60, height: 100 }}
                        >
                            <Illustrations.VinoBaguette />
                        </DraggableElement>
                        <DraggableElement
                            elementId="bottle1"
                            selectedElement={selectedElement}
                            setSelectedElement={setSelectedElement}
                            draggedElement={draggedElement}
                            setDraggedElement={setDraggedElement}
                            dragOffset={dragOffset}
                            setDragOffset={setDragOffset}
                            animationTime={animationTime}
                            style={{ top: '190px', left: '50px', width: 60, height: 100, transform: 'rotate(-10deg)' }}
                        >
                            <Illustrations.VinoBottle />
                        </DraggableElement>
                        <DraggableElement
                            elementId="plant1"
                            selectedElement={selectedElement}
                            setSelectedElement={setSelectedElement}
                            draggedElement={draggedElement}
                            setDraggedElement={setDraggedElement}
                            dragOffset={dragOffset}
                            setDragOffset={setDragOffset}
                            animationTime={animationTime}
                            style={{ top: '200px', left: '2px', width: 46, height: 70 }}
                        >
                            <Illustrations.VinoPlant />
                        </DraggableElement>
                        <DraggableElement
                            elementId="glass1"
                            selectedElement={selectedElement}
                            setSelectedElement={setSelectedElement}
                            draggedElement={draggedElement}
                            setDraggedElement={setDraggedElement}
                            dragOffset={dragOffset}
                            setDragOffset={setDragOffset}
                            animationTime={animationTime}
                            style={{ top: '280px', left: '15px', width: 40, height: 80, transform: 'rotate(-20deg)' }}
                        >
                            <Illustrations.VinoGlass />
                        </DraggableElement>
                        <DraggableElement
                            elementId="grapes1"
                            selectedElement={selectedElement}
                            setSelectedElement={setSelectedElement}
                            draggedElement={draggedElement}
                            setDraggedElement={setDraggedElement}
                            dragOffset={dragOffset}
                            setDragOffset={setDragOffset}
                            animationTime={animationTime}
                            style={{ top: '310px', right: '18px', width: 80, height: 50 }}
                        >
                            <Illustrations.VinoGrapes />
                        </DraggableElement>
                        <DraggableElement
                            elementId="vase1"
                            selectedElement={selectedElement}
                            setSelectedElement={setSelectedElement}
                            draggedElement={draggedElement}
                            setDraggedElement={setDraggedElement}
                            dragOffset={dragOffset}
                            setDragOffset={setDragOffset}
                            animationTime={animationTime}
                            style={{ top: '290px', right: '100px', width: 60, height: 80 }}
                        >
                            <Illustrations.VinoVase />
                        </DraggableElement>
                        <DraggableElement
                            elementId="plant2"
                            selectedElement={selectedElement}
                            setSelectedElement={setSelectedElement}
                            draggedElement={draggedElement}
                            setDraggedElement={setDraggedElement}
                            dragOffset={dragOffset}
                            setDragOffset={setDragOffset}
                            animationTime={animationTime}
                            style={{ top: '184px', left: '120px', width: 50, height: 73 }}
                        >
                            <Illustrations.VinoPlant2 />
                        </DraggableElement>
                        <DraggableElement
                            elementId="cheese1"
                            selectedElement={selectedElement}
                            setSelectedElement={setSelectedElement}
                            draggedElement={draggedElement}
                            setDraggedElement={setDraggedElement}
                            dragOffset={dragOffset}
                            setDragOffset={setDragOffset}
                            animationTime={animationTime}
                            style={{ top: '320px', left: '80px', width: 60, height: 40 }}
                        >
                            <Illustrations.VinoCheese />
                        </DraggableElement>
                        <DraggableElement
                            elementId="spoon1"
                            selectedElement={selectedElement}
                            setSelectedElement={setSelectedElement}
                            draggedElement={draggedElement}
                            setDraggedElement={setDraggedElement}
                            dragOffset={dragOffset}
                            setDragOffset={setDragOffset}
                            animationTime={animationTime}
                            style={{ top: '290px', right: '165px', width: 40, height:60, transform: 'rotate(180deg)' }}
                        >
                            <Illustrations.VinoSpoon />
                        </DraggableElement>
                        <DraggableElement
                            elementId="fork1"
                            selectedElement={selectedElement}
                            setSelectedElement={setSelectedElement}
                            draggedElement={draggedElement}
                            setDraggedElement={setDraggedElement}
                            dragOffset={dragOffset}
                            setDragOffset={setDragOffset}
                            animationTime={animationTime}
                            style={{ top: '260px', right: '60px', width: 70, height: 30, transform: 'rotate(-140deg)' }}
                        >
                            <Illustrations.VinoFork />
                        </DraggableElement>
                        <DraggableElement
                            elementId="plate1"
                            selectedElement={selectedElement}
                            setSelectedElement={setSelectedElement}
                            draggedElement={draggedElement}
                            setDraggedElement={setDraggedElement}
                            dragOffset={dragOffset}
                            setDragOffset={setDragOffset}
                            animationTime={animationTime}
                            style={{ top: '266px', left: '104px', width: 80, height: 28 }}
                        >
                            <Illustrations.VinoPlate />
                        </DraggableElement>
                        <DraggableElement
                            elementId="olives1"
                            selectedElement={selectedElement}
                            setSelectedElement={setSelectedElement}
                            draggedElement={draggedElement}
                            setDraggedElement={setDraggedElement}
                            dragOffset={dragOffset}
                            setDragOffset={setDragOffset}
                            animationTime={animationTime}
                            style={{ top: '260px', right: '0px', width: 50, height: 46 }}
                        >
                            <Illustrations.VinoOlives />
                        </DraggableElement>
                        <DraggableElement
                            elementId="face1"
                            selectedElement={selectedElement}
                            setSelectedElement={setSelectedElement}
                            draggedElement={draggedElement}
                            setDraggedElement={setDraggedElement}
                            dragOffset={dragOffset}
                            setDragOffset={setDragOffset}
                            animationTime={animationTime}
                            style={{ top: '200px', right: '130px', width: 60, height: 60 }}
                        >
                            <Illustrations.VinoFace />
                        </DraggableElement>
                        <DraggableElement
                            elementId="glass2"
                            selectedElement={selectedElement}
                            setSelectedElement={setSelectedElement}
                            draggedElement={draggedElement}
                            setDraggedElement={setDraggedElement}
                            dragOffset={dragOffset}
                            setDragOffset={setDragOffset}
                            animationTime={animationTime}
                            style={{ top: '180px', right: '70px', width: 50, height: 70, transform: 'rotate(-10deg)' }}
                        >
                            <Illustrations.VinoGlass2 />
                        </DraggableElement>
                    </div>
                </div>
            </div>
        </div>
    );
}
