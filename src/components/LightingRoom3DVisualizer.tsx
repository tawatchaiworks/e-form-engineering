import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Box, 
  Layers, 
  RotateCw, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Sparkles, 
  Grid, 
  Sun, 
  Armchair, 
  Ruler, 
  Info,
  Sliders,
  ChevronRight
} from 'lucide-react';

export interface LightingRoom3DVisualizerProps {
  roomLength: number; // m (แนวยาว X)
  roomWidth: number;  // m (แนวกว้าง Y)
  roomHeight: number; // m (ความสูง Z)
  workplaneHeight: number; // m
  selectedRoomType: string;
  fixtureRows: number; // Rows along Length
  fixtureCols: number; // Cols along Width
  fixtureWatts: number;
  fixtureLumens: number;
  efficacyLmPerWatt: number;
  calculatedLux: number;
  targetLux: number;
  beamAngleText?: string;
  luminaireName?: string;
  luminaireIcon?: string;
}

export const LightingRoom3DVisualizer: React.FC<LightingRoom3DVisualizerProps> = ({
  roomLength,
  roomWidth,
  roomHeight,
  workplaneHeight,
  selectedRoomType,
  fixtureRows,
  fixtureCols,
  fixtureWatts,
  fixtureLumens,
  efficacyLmPerWatt,
  calculatedLux,
  targetLux,
  beamAngleText = '110°',
  luminaireName = 'โคมไฟส่องสว่าง',
  luminaireIcon = '💡'
}) => {
  // View mode: '3d' | '2d' | 'elevation' | 'split'
  const [viewMode, setViewMode] = useState<'3d' | '2d' | 'elevation' | 'split'>('3d');

  // 3D Orbital Camera Controls
  const [rotationAngle, setRotationAngle] = useState<number>(35); // Azimuth in degrees
  const [tiltAngle, setTiltAngle] = useState<number>(32); // Elevation/Tilt in degrees
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Feature Toggles
  const [showLightCones, setShowLightCones] = useState<boolean>(true);
  const [showFurniture, setShowFurniture] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showLuxHeatmap, setShowLuxHeatmap] = useState<boolean>(false);
  const [showWorkplane, setShowWorkplane] = useState<boolean>(true);
  const [selectedFixtureIdx, setSelectedFixtureIdx] = useState<number | null>(null);

  // Derived Spacing Calculations
  const spacingLength = roomLength / Math.max(1, fixtureRows);
  const spacingWidth = roomWidth / Math.max(1, fixtureCols);
  const wallSpacingLength = spacingLength / 2;
  const wallSpacingWidth = spacingWidth / 2;
  const totalFixtures = fixtureRows * fixtureCols;

  // Beam angle parsing (extract number or default to 90)
  const numericBeamAngle = useMemo(() => {
    const match = beamAngleText.match(/(\d+)/);
    return match ? Math.min(130, Math.max(20, parseInt(match[1], 10))) : 90;
  }, [beamAngleText]);

  // Handle Drag-to-Rotate for 3D View
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== '3d' && viewMode !== 'split') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setRotationAngle((prev) => (prev + deltaX * 0.6) % 360);
    setTiltAngle((prev) => Math.max(10, Math.min(75, prev - deltaY * 0.4)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 3D Isometric Math Projection Helper
  // Projects (x, y, z) in Room Coordinates [0..L, 0..W, 0..H] into 2D SVG canvas (cx, cy)
  const project3D = (
    x: number,
    y: number,
    z: number,
    canvasW: number = 600,
    canvasH: number = 380
  ) => {
    const cx = canvasW / 2;
    const cy = canvasH / 2 + 30;

    // Center coordinates around origin (-L/2..L/2, -W/2..W/2)
    const ox = x - roomLength / 2;
    const oy = y - roomWidth / 2;
    const oz = z; // 0 is floor, H is ceiling

    // Radians
    const radRot = (rotationAngle * Math.PI) / 180;
    const radTilt = (tiltAngle * Math.PI) / 180;

    // Rotate around Z axis (Azimuth)
    const rx = ox * Math.cos(radRot) - oy * Math.sin(radRot);
    const ry = ox * Math.sin(radRot) + oy * Math.cos(radRot);

    // Scale calculation based on room size to fit viewport nicely
    const maxDim = Math.max(roomLength, roomWidth, roomHeight * 1.3, 5);
    const scale = (Math.min(canvasW, canvasH) * 0.46 * zoomLevel) / maxDim;

    // Perspective/Isometric projection
    const px = cx + rx * scale;
    const py = cy + (ry * Math.sin(radTilt) - oz * Math.cos(radTilt)) * scale;

    return { px, py, scale };
  };

  // Furniture Definitions based on Room Preset
  const furnitureItems = useMemo(() => {
    const items: Array<{
      id: string;
      name: string;
      type: string;
      x: number; // m
      y: number; // m
      z: number; // m
      w: number; // m along X (Length)
      d: number; // m along Y (Width)
      h: number; // m along Z (Height)
      color: string;
      label: string;
      icon: string;
    }> = [];

    const L = roomLength;
    const W = roomWidth;

    if (selectedRoomType.startsWith('office')) {
      // Office: Workstation desks, chairs, storage cabinets, plant
      const deskW = Math.min(1.6, L * 0.28);
      const deskD = Math.min(0.9, W * 0.24);
      const deskH = 0.75;

      // Desk 1 (Left Workstation)
      items.push({
        id: 'desk-1',
        name: 'โต๊ะทำงาน 1 (Workstation A)',
        type: 'desk',
        x: L * 0.25 - deskW / 2,
        y: W * 0.3 - deskD / 2,
        z: 0,
        w: deskW,
        d: deskD,
        h: deskH,
        color: '#475569',
        label: 'โต๊ะทำงาน A + จอภาพ',
        icon: '💻'
      });

      // Desk 2 (Right Workstation)
      items.push({
        id: 'desk-2',
        name: 'โต๊ะทำงาน 2 (Workstation B)',
        type: 'desk',
        x: L * 0.75 - deskW / 2,
        y: W * 0.3 - deskD / 2,
        z: 0,
        w: deskW,
        d: deskD,
        h: deskH,
        color: '#475569',
        label: 'โต๊ะทำงาน B + จอภาพ',
        icon: '💻'
      });

      // Meeting/Discussion Desk in office
      if (L >= 4 && W >= 4) {
        items.push({
          id: 'office-meeting',
          name: 'โต๊ะประชุมย่อย (Discussion Table)',
          type: 'table',
          x: L * 0.5 - 0.7,
          y: W * 0.75 - 0.6,
          z: 0,
          w: 1.4,
          d: 1.2,
          h: 0.75,
          color: '#334155',
          label: 'โต๊ะประชุมย่อย 4 ที่นั่ง',
          icon: '👥'
        });
      }

      // Filing Cabinet along wall
      items.push({
        id: 'cabinet-1',
        name: 'ตู้เอกสาร (Filing Cabinet)',
        type: 'cabinet',
        x: 0.2,
        y: W * 0.8 - 0.5,
        z: 0,
        w: 0.5,
        d: 1.0,
        h: 1.4,
        color: '#1e293b',
        label: 'ตู้เอกสารสูง 1.4m',
        icon: '🗄️'
      });
    } else if (selectedRoomType.startsWith('meeting')) {
      // Meeting Room: Large central boardroom table, screen on front wall, credenza
      const tableW = Math.max(1.8, L * 0.55);
      const tableD = Math.max(1.1, W * 0.45);
      const tableH = 0.75;

      items.push({
        id: 'conf-table',
        name: 'โต๊ะประชุมหลัก (Conference Board Table)',
        type: 'table',
        x: L / 2 - tableW / 2,
        y: W / 2 - tableD / 2,
        z: 0,
        w: tableW,
        d: tableD,
        h: tableH,
        color: '#3b82f6',
        label: 'โต๊ะประชุมใหญ่ 8-12 ที่นั่ง',
        icon: '👥'
      });

      // Presentation Board / TV Screen on wall
      items.push({
        id: 'pres-screen',
        name: 'จอพรีเซนต์ 85" / Whiteboard',
        type: 'screen',
        x: L / 2 - 1.0,
        y: 0.05,
        z: 1.1,
        w: 2.0,
        d: 0.1,
        h: 1.1,
        color: '#0f172a',
        label: 'จอ Smart TV 85" หน้าห้อง',
        icon: '📺'
      });

      // Side buffet / coffee credenza
      items.push({
        id: 'side-credenza',
        name: 'ตู้เบรคกาแฟ (Coffee Credenza)',
        type: 'cabinet',
        x: 0.2,
        y: W * 0.5 - 0.7,
        z: 0,
        w: 0.6,
        d: 1.4,
        h: 0.85,
        color: '#1e293b',
        label: 'เคาน์เตอร์กาแฟ & เครื่องดื่ม',
        icon: '☕'
      });
    } else if (selectedRoomType.startsWith('warehouse')) {
      // Warehouse: Heavy Duty Storage Pallet Racks, Pallets & Forklift Zone
      const rackW = Math.min(1.2, L * 0.28);
      const rackD = Math.max(1.5, W * 0.65);
      const rackH = Math.min(roomHeight * 0.7, 4.0);

      // Rack Row 1
      items.push({
        id: 'rack-1',
        name: 'ชั้นวางพาเลทอุตสาหกรรม Rack A',
        type: 'rack',
        x: L * 0.22 - rackW / 2,
        y: W * 0.5 - rackD / 2,
        z: 0,
        w: rackW,
        d: rackD,
        h: rackH,
        color: '#eab308',
        label: `Pallet Heavy Rack A (${rackH.toFixed(1)}m)`,
        icon: '📦'
      });

      // Rack Row 2
      items.push({
        id: 'rack-2',
        name: 'ชั้นวางพาเลทอุตสาหกรรม Rack B',
        type: 'rack',
        x: L * 0.78 - rackW / 2,
        y: W * 0.5 - rackD / 2,
        z: 0,
        w: rackW,
        d: rackD,
        h: rackH,
        color: '#eab308',
        label: `Pallet Heavy Rack B (${rackH.toFixed(1)}m)`,
        icon: '📦'
      });

      // Wooden Pallets on floor
      items.push({
        id: 'pallet-floor',
        name: 'กองสินค้าบนพาเลทไม้ (Staged Pallets)',
        type: 'pallet',
        x: L * 0.5 - 0.6,
        y: W * 0.5 - 0.6,
        z: 0,
        w: 1.2,
        d: 1.2,
        h: 0.9,
        color: '#b45309',
        label: 'พาเลทสินค้าเตรียมจัดส่ง',
        icon: '🪵'
      });
    } else if (selectedRoomType.startsWith('retail')) {
      // Retail: Display Gondolas, Center Island, Cashier Checkout
      const gondolaW = Math.max(1.2, L * 0.35);
      const gondolaD = 0.8;
      const gondolaH = 1.4;

      items.push({
        id: 'gondola-1',
        name: 'เชลฟ์โชว์สินค้า Gondola Shelf A',
        type: 'shelf',
        x: L * 0.3 - gondolaW / 2,
        y: W * 0.5 - gondolaD / 2,
        z: 0,
        w: gondolaW,
        d: gondolaD,
        h: gondolaH,
        color: '#ec4899',
        label: 'ชั้นวางสินค้ากลางร้าน A',
        icon: '🛍️'
      });

      items.push({
        id: 'gondola-2',
        name: 'เชลฟ์โชว์สินค้า Gondola Shelf B',
        type: 'shelf',
        x: L * 0.7 - gondolaW / 2,
        y: W * 0.5 - gondolaD / 2,
        z: 0,
        w: gondolaW,
        d: gondolaD,
        h: gondolaH,
        color: '#ec4899',
        label: 'ชั้นวางสินค้ากลางร้าน B',
        icon: '🛍️'
      });

      // Cashier Counter
      items.push({
        id: 'cashier-counter',
        name: 'เคาน์เตอร์คิดเงิน (POS Cashier)',
        type: 'counter',
        x: L * 0.5 - 0.75,
        y: W * 0.85 - 0.4,
        z: 0,
        w: 1.5,
        d: 0.8,
        h: 0.95,
        color: '#0284c7',
        label: 'เคาน์เตอร์ชำระเงิน POS',
        icon: '💳'
      });
    } else if (selectedRoomType.startsWith('residential_living')) {
      // Living Room: Sofa, Coffee Table, TV Console, Rug
      const sofaW = Math.max(1.8, L * 0.45);
      const sofaD = 0.9;
      const sofaH = 0.8;

      items.push({
        id: 'sofa-main',
        name: 'โซฟาพักผ่อน (3-Seater Comfort Sofa)',
        type: 'sofa',
        x: L * 0.5 - sofaW / 2,
        y: W * 0.7 - sofaD / 2,
        z: 0,
        w: sofaW,
        d: sofaD,
        h: sofaH,
        color: '#059669',
        label: 'โซฟา 3 ที่นั่งโมเดิร์น',
        icon: '🛋️'
      });

      items.push({
        id: 'coffee-table',
        name: 'โต๊ะกลางกาแฟ (Coffee Table)',
        type: 'table',
        x: L * 0.5 - 0.6,
        y: W * 0.45 - 0.4,
        z: 0,
        w: 1.2,
        d: 0.8,
        h: 0.45,
        color: '#d97706',
        label: 'โต๊ะกลางลายไม้โมเดิร์น',
        icon: '☕'
      });

      items.push({
        id: 'tv-unit',
        name: 'ตู้วางทีวี (TV Media Console)',
        type: 'cabinet',
        x: L * 0.5 - 1.0,
        y: 0.15,
        z: 0,
        w: 2.0,
        d: 0.5,
        h: 0.55,
        color: '#1e293b',
        label: 'ชั้นวางทีวี 65" + ซาวด์บาร์',
        icon: '📺'
      });
    } else if (selectedRoomType.startsWith('residential_bed')) {
      // Bedroom: King Bed, Nightstands, Wardrobe
      const bedW = Math.max(1.8, L * 0.4);
      const bedD = Math.max(2.0, W * 0.5);
      const bedH = 0.65;

      items.push({
        id: 'bed-king',
        name: 'เตียงนอนขนาดคิงไซส์ (King Size Bed)',
        type: 'bed',
        x: L * 0.5 - bedW / 2,
        y: W * 0.4 - bedD / 2,
        z: 0,
        w: bedW,
        d: bedD,
        h: bedH,
        color: '#6366f1',
        label: 'เตียง King Size 6 ฟุต + หมอน',
        icon: '🛏️'
      });

      // Wardrobe
      items.push({
        id: 'wardrobe',
        name: 'ตู้เสื้อผ้าบิวท์อิน (Wardrobe Closet)',
        type: 'cabinet',
        x: 0.2,
        y: W * 0.6 - 0.75,
        z: 0,
        w: 0.6,
        d: 1.5,
        h: 2.2,
        color: '#334155',
        label: 'ตู้เสื้อผ้าสูง 2.2m',
        icon: '🚪'
      });
    } else if (selectedRoomType.startsWith('drawing')) {
      // Drafting / Fine Craft: Large tilted drafting tables, storage
      const draftW = Math.max(1.5, L * 0.35);
      const draftD = 1.0;
      const draftH = 0.95;

      items.push({
        id: 'drafting-desk-1',
        name: 'โต๊ะเขียนแบบสถาปัตย์ โต๊ะ 1',
        type: 'desk',
        x: L * 0.3 - draftW / 2,
        y: W * 0.5 - draftD / 2,
        z: 0,
        w: draftW,
        d: draftD,
        h: draftH,
        color: '#0284c7',
        label: 'โต๊ะเขียนแบบขนาด A0 ปรับเอียง',
        icon: '📐'
      });

      items.push({
        id: 'drafting-desk-2',
        name: 'โต๊ะเขียนแบบสถาปัตย์ โต๊ะ 2',
        type: 'desk',
        x: L * 0.7 - draftW / 2,
        y: W * 0.5 - draftD / 2,
        z: 0,
        w: draftW,
        d: draftD,
        h: draftH,
        color: '#0284c7',
        label: 'โต๊ะเขียนแบบขนาด A0 โต๊ะ 2',
        icon: '📐'
      });
    } else if (selectedRoomType.startsWith('corridor')) {
      // Corridor: Entry Door frame, runner rug, console
      items.push({
        id: 'runner-carpet',
        name: 'พรมทางเดินแนวเส้นตรง (Corridor Carpet)',
        type: 'rug',
        x: 0.4,
        y: W / 2 - 0.4,
        z: 0.01,
        w: L - 0.8,
        d: 0.8,
        h: 0.02,
        color: '#be123c',
        label: 'พรมปูทางเดินสัญจร',
        icon: '🚪'
      });
    } else {
      // Default Multi-purpose room
      items.push({
        id: 'gen-table',
        name: 'โต๊ะทำงานและพื้นที่ใช้งานอเนกประสงค์',
        type: 'table',
        x: L / 2 - 1.0,
        y: W / 2 - 0.75,
        z: 0,
        w: 2.0,
        d: 1.5,
        h: 0.75,
        color: '#475569',
        label: 'โต๊ะทำงานส่วนกลาง',
        icon: '🪑'
      });
    }

    return items;
  }, [selectedRoomType, roomLength, roomWidth, roomHeight]);

  // List of all luminaires in room with 3D positions
  const fixtures3D = useMemo(() => {
    const list: Array<{
      id: string;
      rowIdx: number;
      colIdx: number;
      x: number; // m
      y: number; // m
      z: number; // m (ceiling height)
      label: string;
    }> = [];

    for (let r = 0; r < fixtureRows; r++) {
      for (let c = 0; c < fixtureCols; c++) {
        const x = (r + 0.5) * spacingLength;
        const y = (c + 0.5) * spacingWidth;
        list.push({
          id: `f-${r}-${c}`,
          rowIdx: r,
          colIdx: c,
          x,
          y,
          z: roomHeight,
          label: `โคม #${r * fixtureCols + c + 1} (R${r + 1},C${c + 1})`
        });
      }
    }
    return list;
  }, [fixtureRows, fixtureCols, spacingLength, spacingWidth, roomHeight]);

  // SVG Dimension Line Component for 2D View
  const renderDimensionLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    text: string,
    offset: number = 0,
    isVertical: boolean = false
  ) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const arrowSize = 4;

    return (
      <g className="select-none font-mono text-[9px]">
        {/* Main Dimension Line */}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeDasharray="none"
        />

        {/* Start Tick / Arrow */}
        <line
          x1={isVertical ? x1 - 3 : x1}
          y1={isVertical ? y1 : y1 - 3}
          x2={isVertical ? x1 + 3 : x1}
          y2={isVertical ? y1 : y1 + 3}
          stroke="#38bdf8"
          strokeWidth="1.2"
        />

        {/* End Tick / Arrow */}
        <line
          x1={isVertical ? x2 - 3 : x2}
          y1={isVertical ? y2 : y2 - 3}
          x2={isVertical ? x2 + 3 : x2}
          y2={isVertical ? y2 : y2 + 3}
          stroke="#38bdf8"
          strokeWidth="1.2"
        />

        {/* Dimension Text Background Pill */}
        <rect
          x={isVertical ? midX - 22 : midX - 20}
          y={isVertical ? midY - 6 : midY - 6}
          width={isVertical ? 44 : 40}
          height="12"
          fill="#090d16"
          rx="2"
          stroke="#0284c7"
          strokeWidth="0.5"
        />

        {/* Text Label */}
        <text
          x={midX}
          y={midY + 3}
          fill="#38bdf8"
          fontWeight="bold"
          textAnchor="middle"
        >
          {text}
        </text>
      </g>
    );
  };

  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 text-white overflow-hidden shadow-2xl space-y-0">
      
      {/* Visualizer Top Bar: Mode Tabs, Camera Controls & Quick Stats */}
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === '3d'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D จำลองห้องเสมือนจริง</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === '2d'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D ผังเพดาน & ระยะมิติ</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('elevation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'elevation'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>รูปตัดด้านข้าง (Elevation)</span>
          </button>
        </div>

        {/* Right: Quick Toggles (Cones, Furniture, Dimensions) */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          
          <button
            type="button"
            onClick={() => setShowLightCones(!showLightCones)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition flex items-center gap-1 cursor-pointer ${
              showLightCones
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="เปิด/ปิด การแสดงกรวยลำแสง 3D จากโคมไฟ"
          >
            <Sun className="w-3 h-3" />
            <span>กรวยลำแสง ({numericBeamAngle}°)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFurniture(!showFurniture)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition flex items-center gap-1 cursor-pointer ${
              showFurniture
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="เปิด/ปิด การแสดงเฟอร์นิเจอร์จำลองตามประเภทห้อง"
          >
            <Armchair className="w-3 h-3" />
            <span>เฟอร์นิเจอร์ ({furnitureItems.length} ชิ้น)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDimensions(!showDimensions)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition flex items-center gap-1 cursor-pointer ${
              showDimensions
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="เปิด/ปิด เส้นบอกระยะห่างโคมและผนัง"
          >
            <Ruler className="w-3 h-3" />
            <span>เส้นบอกระยะ (S_L, S_W)</span>
          </button>

          {/* Reset Orbit Button */}
          {viewMode === '3d' && (
            <button
              type="button"
              onClick={() => {
                setRotationAngle(35);
                setTiltAngle(32);
                setZoomLevel(1.0);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="รีเซ็ตมุมมอง 3D กล้องหลัก"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

      </div>

      {/* Main Interactive Stage Area */}
      <div 
        className="relative w-full h-96 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 select-none overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >

        {/* 1. 3D ISOMETRIC / PERSPECTIVE ROOM SIMULATION */}
        {viewMode === '3d' && (
          <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
            
            <svg 
              viewBox="0 0 700 420" 
              className="w-full h-full"
            >
              <defs>
                {/* Volumetric Light Gradient */}
                <radialGradient id="lightConeGrad" cx="50%" cy="0%" r="90%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.75" />
                  <stop offset="35%" stopColor="#fbbf24" stopOpacity="0.30" />
                  <stop offset="80%" stopColor="#fef08a" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#fef08a" stopOpacity="0.0" />
                </radialGradient>

                {/* Floor Illuminance Glow Pattern */}
                <radialGradient id="floorLuxGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
                </radialGradient>

                {/* Drop Shadow filter */}
                <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
                </filter>
              </defs>

              {/* 3D Floor Surface Polygon */}
              {(() => {
                const p00 = project3D(0, 0, 0, 700, 420);
                const pL0 = project3D(roomLength, 0, 0, 700, 420);
                const pLW = project3D(roomLength, roomWidth, 0, 700, 420);
                const p0W = project3D(0, roomWidth, 0, 700, 420);

                const floorPoints = `${p00.px},${p00.py} ${pL0.px},${pL0.py} ${pLW.px},${pLW.py} ${p0W.px},${p0W.py}`;

                return (
                  <g id="3d-floor-group">
                    {/* Floor Base */}
                    <polygon
                      points={floorPoints}
                      fill="#0f172a"
                      stroke="#334155"
                      strokeWidth="2"
                    />

                    {/* Floor Tiles / Coordinate Grid (Every 1m) */}
                    {Array.from({ length: Math.ceil(roomLength) + 1 }).map((_, i) => {
                      const x = Math.min(roomLength, i);
                      const sp = project3D(x, 0, 0, 700, 420);
                      const ep = project3D(x, roomWidth, 0, 700, 420);
                      return (
                        <line
                          key={`fg-x-${i}`}
                          x1={sp.px}
                          y1={sp.py}
                          x2={ep.px}
                          y2={ep.py}
                          stroke="#1e293b"
                          strokeWidth="1"
                          strokeDasharray="3,3"
                        />
                      );
                    })}

                    {Array.from({ length: Math.ceil(roomWidth) + 1 }).map((_, j) => {
                      const y = Math.min(roomWidth, j);
                      const sp = project3D(0, y, 0, 700, 420);
                      const ep = project3D(roomLength, y, 0, 700, 420);
                      return (
                        <line
                          key={`fg-y-${j}`}
                          x1={sp.px}
                          y1={sp.py}
                          x2={ep.px}
                          y2={ep.py}
                          stroke="#1e293b"
                          strokeWidth="1"
                          strokeDasharray="3,3"
                        />
                      );
                    })}

                    {/* Floor Lighting Footprint Glow Circles */}
                    {fixtures3D.map((f, idx) => {
                      const fp = project3D(f.x, f.y, 0, 700, 420);
                      const radiusPx = (spacingLength * fp.scale * 0.75);
                      return (
                        <ellipse
                          key={`lux-pool-${idx}`}
                          cx={fp.px}
                          cy={fp.py}
                          rx={radiusPx}
                          ry={radiusPx * Math.sin((tiltAngle * Math.PI) / 180)}
                          fill="url(#floorLuxGlow)"
                        />
                      );
                    })}
                  </g>
                );
              })()}

              {/* 3D Walls (Back Wall and Left Wall) */}
              {(() => {
                const p00_0 = project3D(0, 0, 0, 700, 420);
                const pL0_0 = project3D(roomLength, 0, 0, 700, 420);
                const p0W_0 = project3D(0, roomWidth, 0, 700, 420);

                const p00_H = project3D(0, 0, roomHeight, 700, 420);
                const pL0_H = project3D(roomLength, 0, roomHeight, 700, 420);
                const p0W_H = project3D(0, roomWidth, roomHeight, 700, 420);

                return (
                  <g id="3d-walls-group" className="opacity-85">
                    {/* Back Wall (Y=0) */}
                    <polygon
                      points={`${p00_0.px},${p00_0.py} ${pL0_0.px},${pL0_0.py} ${pL0_H.px},${pL0_H.py} ${p00_H.px},${p00_H.py}`}
                      fill="rgba(15, 23, 42, 0.75)"
                      stroke="#1e293b"
                      strokeWidth="1.5"
                    />

                    {/* Left Wall (X=0) */}
                    <polygon
                      points={`${p00_0.px},${p00_0.py} ${p0W_0.px},${p0W_0.py} ${p0W_H.px},${p0W_H.py} ${p00_H.px},${p00_H.py}`}
                      fill="rgba(30, 41, 59, 0.65)"
                      stroke="#1e293b"
                      strokeWidth="1.5"
                    />

                    {/* Height Scale Markings on Corner Wall Post */}
                    <line
                      x1={p00_0.px}
                      y1={p00_0.py}
                      x2={p00_H.px}
                      y2={p00_H.py}
                      stroke="#475569"
                      strokeWidth="2.5"
                    />

                    {/* Height Label */}
                    <text
                      x={p00_H.px - 10}
                      y={(p00_0.py + p00_H.py) / 2}
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      H = {roomHeight}m
                    </text>
                  </g>
                );
              })()}

              {/* 3D Simulated Furniture Blocks */}
              {showFurniture && (
                <g id="3d-furniture-group">
                  {furnitureItems.map((item) => {
                    // Calculate 8 bounding box corners for the 3D furniture
                    const p000 = project3D(item.x, item.y, item.z, 700, 420);
                    const p100 = project3D(item.x + item.w, item.y, item.z, 700, 420);
                    const p110 = project3D(item.x + item.w, item.y + item.d, item.z, 700, 420);
                    const p010 = project3D(item.x, item.y + item.d, item.z, 700, 420);

                    const p001 = project3D(item.x, item.y, item.z + item.h, 700, 420);
                    const p101 = project3D(item.x + item.w, item.y, item.z + item.h, 700, 420);
                    const p111 = project3D(item.x + item.w, item.y + item.d, item.z + item.h, 700, 420);
                    const p011 = project3D(item.x, item.y + item.d, item.z + item.h, 700, 420);

                    // Top Surface Points
                    const topPoints = `${p001.px},${p001.py} ${p101.px},${p101.py} ${p111.px},${p111.py} ${p011.px},${p011.py}`;
                    // Front Surface Points
                    const frontPoints = `${p010.px},${p010.py} ${p110.px},${p110.py} ${p111.px},${p111.py} ${p011.px},${p011.py}`;
                    // Right Surface Points
                    const rightPoints = `${p100.px},${p100.py} ${p110.px},${p110.py} ${p111.px},${p111.py} ${p101.px},${p101.py}`;

                    const centerTop = {
                      x: (p001.px + p101.px + p111.px + p011.px) / 4,
                      y: (p001.py + p101.py + p111.py + p011.py) / 4
                    };

                    return (
                      <g key={item.id} className="cursor-pointer group" filter="url(#shadow3d)">
                        {/* Shadow on Floor */}
                        <polygon
                          points={`${p000.px},${p000.py} ${p100.px},${p100.py} ${p110.px},${p110.py} ${p010.px},${p010.py}`}
                          fill="rgba(0,0,0,0.5)"
                        />

                        {/* Front Side */}
                        <polygon
                          points={frontPoints}
                          fill={item.color}
                          stroke="#1e293b"
                          strokeWidth="1"
                          opacity="0.9"
                        />

                        {/* Right Side */}
                        <polygon
                          points={rightPoints}
                          fill={item.color}
                          stroke="#0f172a"
                          strokeWidth="1"
                          opacity="0.75"
                        />

                        {/* Top Side */}
                        <polygon
                          points={topPoints}
                          fill={item.color}
                          stroke="#64748b"
                          strokeWidth="1"
                          opacity="1.0"
                        />

                        {/* Furniture Icon & Label Overlay */}
                        <text
                          x={centerTop.x}
                          y={centerTop.y + 4}
                          fill="#f8fafc"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="pointer-events-none drop-shadow"
                        >
                          {item.icon}
                        </text>

                        {/* Hover Tooltip for Furniture */}
                        <title>{`${item.name} (${item.label}) - กว้าง ${item.w}m × ยาว ${item.d}m × สูง ${item.h}m`}</title>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 3D Volumetric Light Cones (Projected from Luminaire to Floor) */}
              {showLightCones && (
                <g id="3d-light-cones-group" className="pointer-events-none">
                  {fixtures3D.map((f, idx) => {
                    const topP = project3D(f.x, f.y, f.z, 700, 420);
                    const botP = project3D(f.x, f.y, 0, 700, 420);
                    
                    // Cone spread radius on floor based on beam angle
                    const spreadRadiusM = Math.tan(((numericBeamAngle / 2) * Math.PI) / 180) * roomHeight;
                    const spreadPx = spreadRadiusM * topP.scale;

                    const radTilt = (tiltAngle * Math.PI) / 180;
                    const spreadY = spreadPx * Math.sin(radTilt);

                    return (
                      <g key={`cone-${idx}`} opacity="0.8">
                        {/* Cone Body Polygon */}
                        <polygon
                          points={`
                            ${topP.px},${topP.py} 
                            ${botP.px - spreadPx},${botP.py} 
                            ${botP.px + spreadPx},${botP.py}
                          `}
                          fill="url(#lightConeGrad)"
                        />

                        {/* Cone Base Ellipse on Floor */}
                        <ellipse
                          cx={botP.px}
                          cy={botP.py}
                          rx={spreadPx}
                          ry={spreadY}
                          fill="rgba(245, 158, 11, 0.15)"
                          stroke="rgba(251, 191, 36, 0.3)"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 3D Ceiling Fixtures (Luminaires) */}
              <g id="3d-fixtures-group">
                {fixtures3D.map((f, idx) => {
                  const p = project3D(f.x, f.y, f.z, 700, 420);
                  const isSelected = selectedFixtureIdx === idx;

                  return (
                    <g 
                      key={`fixture-node-${idx}`} 
                      className="cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFixtureIdx(isSelected ? null : idx);
                      }}
                    >
                      {/* Outer Emissive Glow Ring */}
                      <circle
                        cx={p.px}
                        cy={p.py}
                        r="14"
                        fill="rgba(245, 158, 11, 0.25)"
                        className="animate-pulse"
                      />

                      {/* Fixture Mount Disc */}
                      <circle
                        cx={p.px}
                        cy={p.py}
                        r={isSelected ? "9" : "7.5"}
                        fill={isSelected ? "#fbbf24" : "#f59e0b"}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all duration-150"
                      />

                      {/* Inner Core */}
                      <circle
                        cx={p.px}
                        cy={p.py}
                        r="3"
                        fill="#ffffff"
                      />

                      {/* Fixture Number Tag */}
                      <text
                        x={p.px}
                        y={p.py - 11}
                        fill="#fef08a"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="drop-shadow"
                      >
                        #{idx + 1}
                      </text>

                      {/* Tooltip on Hover */}
                      <title>{`${f.label} | กำลังวัตต์: ${fixtureWatts}W | ลูเมน: ${fixtureLumens} lm | ความสูง: ${roomHeight}m`}</title>
                    </g>
                  );
                })}
              </g>

              {/* 3D Dimension Callouts Overlay */}
              {showDimensions && (
                <g id="3d-dimension-callouts" className="pointer-events-none font-mono text-[9px]">
                  {/* Spacing along Length */}
                  {(() => {
                    const p1 = project3D(spacingLength * 0.5, spacingWidth * 0.5, roomHeight, 700, 420);
                    const p2 = project3D(spacingLength * 1.5, spacingWidth * 0.5, roomHeight, 700, 420);
                    
                    if (fixtureRows > 1) {
                      return (
                        <g>
                          <line
                            x1={p1.px}
                            y1={p1.py}
                            x2={p2.px}
                            y2={p2.py}
                            stroke="#38bdf8"
                            strokeWidth="1.5"
                            strokeDasharray="3,3"
                          />
                          <rect
                            x={(p1.px + p2.px) / 2 - 28}
                            y={(p1.py + p2.py) / 2 - 7}
                            width="56"
                            height="14"
                            fill="#0f172a"
                            rx="3"
                            stroke="#0284c7"
                            strokeWidth="0.8"
                          />
                          <text
                            x={(p1.px + p2.px) / 2}
                            y={(p1.py + p2.py) / 2 + 3}
                            fill="#38bdf8"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            S_L = {spacingLength.toFixed(2)}m
                          </text>
                        </g>
                      );
                    }
                    return null;
                  })()}

                  {/* Wall Spacing Callout */}
                  {(() => {
                    const p0 = project3D(0, spacingWidth * 0.5, roomHeight, 700, 420);
                    const p1 = project3D(spacingLength * 0.5, spacingWidth * 0.5, roomHeight, 700, 420);
                    return (
                      <g>
                        <line
                          x1={p0.px}
                          y1={p0.py}
                          x2={p1.px}
                          y2={p1.py}
                          stroke="#fb7185"
                          strokeWidth="1.2"
                          strokeDasharray="2,2"
                        />
                        <rect
                          x={(p0.px + p1.px) / 2 - 24}
                          y={(p0.py + p1.py) / 2 - 6}
                          width="48"
                          height="12"
                          fill="#0f172a"
                          rx="2"
                          stroke="#e11d48"
                          strokeWidth="0.6"
                        />
                        <text
                          x={(p0.px + p1.px) / 2}
                          y={(p0.py + p1.py) / 2 + 3}
                          fill="#fb7185"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ผนัง: {wallSpacingLength.toFixed(2)}m
                        </text>
                      </g>
                    );
                  })()}
                </g>
              )}

            </svg>

            {/* Drag & Orbit Hints / On-screen 3D Controls */}
            <div className="absolute bottom-2.5 left-3 flex items-center gap-2 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 shadow-lg">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>คลิกและลากเมาส์เพื่อหมุนมุมมอง 3D ({Math.round(rotationAngle)}°, {Math.round(tiltAngle)}°)</span>
            </div>

            {/* 3D Camera Quick Rotation Buttons */}
            <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur p-1 rounded-xl border border-slate-800 shadow-lg">
              <button
                type="button"
                onClick={() => setRotationAngle((prev) => (prev - 15) % 360)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                title="หมุนซ้าย 15°"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotationAngle((prev) => (prev + 15) % 360)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                title="หมุนขวา 15°"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTiltAngle((prev) => Math.min(75, prev + 8))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition"
                title="มองจากมุมสูงขึ้น (Top Down)"
              >
                <ChevronRight className="w-3.5 h-3.5 -rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => setTiltAngle((prev) => Math.max(10, prev - 8))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition"
                title="มองจากระดับสายตา (Eye-level)"
              >
                <ChevronRight className="w-3.5 h-3.5 rotate-90" />
              </button>
            </div>

          </div>
        )}

        {/* 2. 2D ARCHITECTURAL CEILING BLUEPRINT WITH PRECISE DIMENSIONS */}
        {viewMode === '2d' && (
          <div className="w-full h-full relative p-4 flex items-center justify-center">
            
            {(() => {
              // Calculate SVG bounds with padding for outer dimension lines
              const padX = 65; // margin for left width dimensions
              const padY = 55; // margin for top length dimensions
              const scale = Math.min(
                (600 - padX * 2) / Math.max(1, roomLength),
                (350 - padY * 2) / Math.max(1, roomWidth)
              );

              const svgW = roomLength * scale + padX * 2;
              const svgH = roomWidth * scale + padY * 2;

              const originX = padX;
              const originY = padY;

              return (
                <svg
                  viewBox={`0 0 ${svgW} ${svgH}`}
                  className="w-full h-full max-h-84 drop-shadow-xl"
                >
                  <defs>
                    <pattern id="cadGrid" width={scale} height={scale} patternUnits="userSpaceOnUse">
                      <rect width={scale} height={scale} fill="none" stroke="#1e293b" strokeWidth="0.6" />
                    </pattern>
                  </defs>

                  {/* Outer CAD Background Grid */}
                  <rect
                    x={originX}
                    y={originY}
                    width={roomLength * scale}
                    height={roomWidth * scale}
                    fill="#090d16"
                    stroke="#475569"
                    strokeWidth="2.5"
                    rx="4"
                  />

                  {/* Sub-grid (1m x 1m) */}
                  <rect
                    x={originX}
                    y={originY}
                    width={roomLength * scale}
                    height={roomWidth * scale}
                    fill="url(#cadGrid)"
                  />

                  {/* 2D Architectural Furniture Overlays */}
                  {showFurniture && (
                    <g id="2d-furniture-layout" className="opacity-90">
                      {furnitureItems.map((item) => {
                        const fx = originX + item.x * scale;
                        const fy = originY + item.y * scale;
                        const fw = item.w * scale;
                        const fh = item.d * scale;

                        return (
                          <g key={`2d-furn-${item.id}`}>
                            {/* Furniture 2D Rectangle */}
                            <rect
                              x={fx}
                              y={fy}
                              width={fw}
                              height={fh}
                              fill={item.color}
                              stroke="#64748b"
                              strokeWidth="1.2"
                              rx="3"
                              opacity="0.85"
                            />
                            {/* Inner Accent Line */}
                            <rect
                              x={fx + 2}
                              y={fy + 2}
                              width={Math.max(2, fw - 4)}
                              height={Math.max(2, fh - 4)}
                              fill="none"
                              stroke="rgba(255,255,255,0.2)"
                              strokeWidth="0.8"
                            />
                            {/* Label */}
                            <text
                              x={fx + fw / 2}
                              y={fy + fh / 2 + 3}
                              fill="#ffffff"
                              fontSize={Math.min(9, fw * 0.22)}
                              fontWeight="bold"
                              textAnchor="middle"
                              className="select-none font-sans drop-shadow"
                            >
                              {item.icon} {item.name.split(' ')[0]}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* Fixture Light Coverage Pools (Radius) */}
                  {Array.from({ length: fixtureRows }).flatMap((_, r) =>
                    Array.from({ length: fixtureCols }).map((_, c) => {
                      const cx = originX + (r + 0.5) * (spacingLength * scale);
                      const cy = originY + (c + 0.5) * (spacingWidth * scale);
                      const radiusPx = (spacingLength * scale * 0.7);

                      return (
                        <g key={`2d-fixture-${r}-${c}`}>
                          {/* Outer Beam Overlap Circle */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={radiusPx}
                            fill="rgba(245, 158, 11, 0.12)"
                            stroke="rgba(251, 191, 36, 0.25)"
                            strokeWidth="0.8"
                            strokeDasharray="2,2"
                          />

                          {/* Fixture Node Center */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r="6"
                            fill="#f59e0b"
                            stroke="#ffffff"
                            strokeWidth="1.8"
                          />
                          
                          {/* Center Dot */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r="2"
                            fill="#0f172a"
                          />

                          {/* Coordinate Tag */}
                          <text
                            x={cx}
                            y={cy - 9}
                            fill="#fef08a"
                            fontSize="8"
                            fontWeight="bold"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            #{r * fixtureCols + c + 1}
                          </text>
                        </g>
                      );
                    })
                  )}

                  {/* Detailed Dimension Lines (All Axes) */}
                  {showDimensions && (
                    <g id="2d-dimension-annotations">
                      
                      {/* Top Overall Length: L = ... m */}
                      {renderDimensionLine(
                        originX,
                        originY - 30,
                        originX + roomLength * scale,
                        originY - 30,
                        `ความยาวรวม L = ${roomLength}m`
                      )}

                      {/* Top Sub-dimensions (Wall Spacing & Fixture Spacings along Length) */}
                      {/* Wall to first fixture */}
                      {renderDimensionLine(
                        originX,
                        originY - 14,
                        originX + wallSpacingLength * scale,
                        originY - 14,
                        `${wallSpacingLength.toFixed(2)}m`
                      )}

                      {/* Intermediate Spacings */}
                      {Array.from({ length: Math.max(0, fixtureRows - 1) }).map((_, r) => {
                        const sx = originX + (r + 0.5) * (spacingLength * scale);
                        const ex = originX + (r + 1.5) * (spacingLength * scale);
                        return (
                          <g key={`dim-r-${r}`}>
                            {renderDimensionLine(
                              sx,
                              originY - 14,
                              ex,
                              originY - 14,
                              `S_L=${spacingLength.toFixed(2)}m`
                            )}
                          </g>
                        );
                      })}

                      {/* Last Fixture to Right Wall */}
                      {renderDimensionLine(
                        originX + (roomLength - wallSpacingLength) * scale,
                        originY - 14,
                        originX + roomLength * scale,
                        originY - 14,
                        `${wallSpacingLength.toFixed(2)}m`
                      )}

                      {/* Left Overall Width: W = ... m */}
                      {renderDimensionLine(
                        originX - 42,
                        originY,
                        originX - 42,
                        originY + roomWidth * scale,
                        `W=${roomWidth}m`,
                        0,
                        true
                      )}

                      {/* Left Sub-dimensions (Wall to first & Spacings along Width) */}
                      {renderDimensionLine(
                        originX - 20,
                        originY,
                        originX - 20,
                        originY + wallSpacingWidth * scale,
                        `${wallSpacingWidth.toFixed(2)}m`,
                        0,
                        true
                      )}

                      {Array.from({ length: Math.max(0, fixtureCols - 1) }).map((_, c) => {
                        const sy = originY + (c + 0.5) * (spacingWidth * scale);
                        const ey = originY + (c + 1.5) * (spacingWidth * scale);
                        return (
                          <g key={`dim-c-${c}`}>
                            {renderDimensionLine(
                              originX - 20,
                              sy,
                              originX - 20,
                              ey,
                              `S_W=${spacingWidth.toFixed(2)}m`,
                              0,
                              true
                            )}
                          </g>
                        );
                      })}

                      {renderDimensionLine(
                        originX - 20,
                        originY + (roomWidth - wallSpacingWidth) * scale,
                        originX - 20,
                        originY + roomWidth * scale,
                        `${wallSpacingWidth.toFixed(2)}m`,
                        0,
                        true
                      )}

                    </g>
                  )}

                </svg>
              );
            })()}

          </div>
        )}

        {/* 3. ELEVATION CROSS SECTION (รูปตัดด้านข้าง แสดงความสูงและระนาบงาน) */}
        {viewMode === 'elevation' && (
          <div className="w-full h-full p-4 flex items-center justify-center">
            <svg viewBox="0 0 620 320" className="w-full h-full max-h-80 drop-shadow-xl">
              
              {/* Room Box (Elevation Side View) */}
              <rect
                x="80"
                y="40"
                width="460"
                height="220"
                fill="#0f172a"
                stroke="#475569"
                strokeWidth="2.5"
                rx="4"
              />

              {/* Ceiling Slab Line */}
              <line x1="80" y1="40" x2="540" y2="40" stroke="#f59e0b" strokeWidth="4" />
              <text x="548" y="44" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                ฝ้าเพดาน (Ceiling) H={roomHeight}m
              </text>

              {/* Floor Slab Line */}
              <line x1="80" y1="260" x2="540" y2="260" stroke="#64748b" strokeWidth="4" />
              <text x="548" y="264" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">
                ระดับพื้นห้อง (Floor Level 0.00m)
              </text>

              {/* Workplane (ระนาบงาน 0.75m) */}
              {(() => {
                const workplaneY = 260 - (workplaneHeight / roomHeight) * 220;
                return (
                  <g>
                    <line
                      x1="80"
                      y1={workplaneY}
                      x2="540"
                      y2={workplaneY}
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                    />
                    <text x="548" y={workplaneY + 3} fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      ระนาบโต๊ะทำงาน (Workplane) {workplaneHeight}m
                    </text>
                  </g>
                );
              })()}

              {/* Elevation Fixture Cones and Luminaires along Length */}
              {Array.from({ length: fixtureRows }).map((_, r) => {
                const fx = 80 + (r + 0.5) * (460 / fixtureRows);
                const fy = 40;
                const coneSpreadPx = Math.min(180, Math.tan(((numericBeamAngle / 2) * Math.PI) / 180) * 220);

                return (
                  <g key={`elev-f-${r}`}>
                    {/* Beam Cone */}
                    <polygon
                      points={`${fx},${fy} ${fx - coneSpreadPx},260 ${fx + coneSpreadPx},260`}
                      fill="url(#lightConeGrad)"
                      opacity="0.65"
                    />

                    {/* Fixture on Ceiling */}
                    <rect
                      x={fx - 14}
                      y="36"
                      width="28"
                      height="8"
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      rx="2"
                    />
                    <circle cx={fx} cy="44" r="4" fill="#ffffff" />
                  </g>
                );
              })}

              {/* Height Dimension Line on Left */}
              {renderDimensionLine(50, 40, 50, 260, `H=${roomHeight}m`, 0, true)}

            </svg>
          </div>
        )}

      </div>

      {/* Visualizer Bottom Detail Legend Bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Luminaire & Grid Information */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <span className="text-base">{luminaireIcon}</span>
            <span>{luminaireName}</span>
          </div>

          <div className="h-3 w-px bg-slate-700 hidden sm:block"></div>

          <div className="text-slate-300">
            <span>ผังติดตั้ง: </span>
            <span className="font-mono font-bold text-white">
              {fixtureCols} แถว (กว้าง) × {fixtureRows} แถว (ยาว) = {totalFixtures} โคม
            </span>
          </div>

          <div className="h-3 w-px bg-slate-700 hidden sm:block"></div>

          <div className="text-slate-300">
            <span>ระยะห่างโคม: </span>
            <span className="font-mono font-bold text-sky-400">
              S_L = {spacingLength.toFixed(2)}m | S_W = {spacingWidth.toFixed(2)}m
            </span>
          </div>
        </div>

        {/* Right: Actual Lux & Target Badge */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">ความสว่างคำนวณจริง:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-black text-sm">
            {Math.round(calculatedLux)} Lux
          </span>
          <span className="text-[10px] text-slate-500">
            (เป้าหมาย: {targetLux} Lux)
          </span>
        </div>

      </div>

    </div>
  );
};
