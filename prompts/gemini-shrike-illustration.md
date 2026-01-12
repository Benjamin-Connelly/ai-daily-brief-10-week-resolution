# Gemini 3 Pro Prompt: The Shrike's Larder Illustration

## Prompt for Google AI Studio (Nano Banana Pro)

```
Create a brutalist, stark black and white line art illustration with red accents, in the style of old scientific woodcut prints or anatomical drawings. The image should have a distressed, grunge texture background resembling aged paper or concrete.

COMPOSITION:
- A detailed shrike bird (loggerhead shrike) perched on a thick, gnarled thorny branch in the upper right portion of the image. The bird faces left with a watchful, intense expression. It has a hooked beak, sharp talons, and detailed feathers rendered with fine cross-hatching lines.
- Multiple thorny branches extend across the middle and left portions of the image, creating a network of bare, twisted branches with numerous sharp, prominent thorns.
- Three small mice are impaled on these thorns:
  * One mouse in the upper-middle section, hanging head-down from a thorn that pierces through its back, with bright red blood streaks emanating from the wound
  * Another mouse in the lower-left section, also impaled through its back, hanging downwards with red blood streaks
  * A third mouse in the lower-right section, similarly impaled and bleeding, with blood dripping down the branch below it
- The mice should be anatomically detailed but stylized, showing distress and vulnerability.

STYLE:
- Black and white line art with cross-hatching and stippling for texture
- Bright red (#ff0000) for blood marks, streaks, splatters, and drips
- Woodcut print aesthetic with bold, confident lines
- Distressed background texture with faint scratches and smudges
- High contrast, stark, brutalist aesthetic
- No color except black, white, and red
- Rough, hand-drawn quality to the lines

TEXT ELEMENTS (integrated into the illustration):
- Large, bold, sans-serif black text at the top: "AI RESOLUTION PROJECT" spanning two lines
- Below and to the right: "BENJAMIN CONNELLY" in bold black text
- At the bottom right, large bold text: "THE SHRIKE'S LARDER" with a subtle red outline or shadow
- At the bottom left, small text: "© 2024 BENJAMIN CONNELLY. BRUTALIST AI."

TECHNICAL SPECS:
- Aspect ratio: 16:9 or 4:3 (landscape)
- Resolution: High resolution suitable for web display
- Format: PNG with transparency or white background
- Style: Brutalist, raw, unrefined, powerful
- Mood: Dark, naturalistic, unsettling, memorable

The overall impression should be a grim, naturalistic scene that serves as a metaphor for the "AI Resolution Project" - suggesting collection, predation, and the harsh reality of the shrike's larder where prey is impaled and stored.
```

## Alternative Shorter Prompt

```
Brutalist black and white woodcut-style illustration with red accents. A shrike bird perched on thorny branches in upper right, three mice impaled on thorns with red blood streaks, distressed paper texture background. Text: "AI RESOLUTION PROJECT" at top, "BENJAMIN CONNELLY" below, "THE SHRIKE'S LARDER" at bottom right. Style: old scientific illustration, cross-hatching, stark contrast, raw and powerful. No colors except black, white, and bright red for blood.
```

## Usage Notes

1. **In Google AI Studio**: Paste the prompt into the image generation interface
2. **Iterate**: You may need to refine based on results - adjust the description of blood, bird position, or text placement
3. **Save**: Download the generated image as PNG
4. **Place**: Save to `assets/images/shrike-larder.png` (root-level shared assets directory)
5. **Update Component**: Replace the SVG in `week-01-resolution-tracker/src/pages/LandingPage.tsx` with:
   ```tsx
   <img 
     src="/assets/images/shrike-larder.png" 
     alt="The Shrike's Larder - AI Resolution Project"
     style={{ width: '100%', height: 'auto', display: 'block' }}
   />
   ```
6. **Access**: The image will be accessible at `ai-resolution.benjaminconnelly.com/assets/images/shrike-larder.png` for all weeks

## Expected Output

The generated image should match the reference image you showed me:
- Shrike bird on right
- Impaled mice with blood
- Thorny branches
- Brutalist text styling
- Distressed background texture
