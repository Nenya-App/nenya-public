// The words people can pick from in the sensory gateways (light, tone, rhythm, taste, scent, pattern, perspective, movement). One place for all of
// them, grouped so related words sit together, each with a short plain description for the "i" button beside it.
//
// Starting points, not a measurement: nothing here has a fixed meaning, and a person can always add their own word ("Other") instead. Words are
// described in everyday terms and by comparison ("like..."), never as a feeling or a condition. The descriptions of the first words (the ones the
// lists began with) live in TermInfo.tsx; a word with no description here uses that one. Drafted by Claude for the owner to edit.

export type SenseCategory = 'lightQuality' | 'timbre' | 'rhythm' | 'taste' | 'scent' | 'pattern' | 'perspective' | 'direction' | 'quality';

export interface SenseWord {
  term: string;
  /** Absent only for the words the lists began with (their text is in TermInfo.tsx). */
  description?: string;
}
export interface SenseGroup {
  label: string;
  words: SenseWord[];
}

/** An original word (described in TermInfo.tsx) or a new one with its description. */
const o = (term: string): SenseWord => ({ term });
const n = (term: string, description: string): SenseWord => ({ term, description });

export const SENSE_WORDS: Record<SenseCategory, SenseGroup[]> = {
  // ───────────────────────── Sight: the quality of the light ─────────────────────────
  lightQuality: [
    { label: 'Steadiness', words: [
      o('Steady'), o('Pulsing'), o('Flickering'),
      n('Wavering', 'Light that leans one way and the other without settling, like a candle in a draft.'),
      n('Blinking', 'Light that goes on and off in clear beats, like a signal or a distant beacon.'),
      n('Twinkling', 'Tiny, quick changes in brightness, like stars seen through moving air.'),
      n('Flashing', 'Sudden bursts of bright light with dark between them, like lightning or a camera.'),
    ] },
    { label: 'Glow and spread', words: [
      o('Glowing'), o('Shimmering'), o('Radiating'),
      n('Luminous', 'Light that seems to come from the thing itself, like the moon or a lit window.'),
      n('Sparkling', 'Many small points of bright light, like sun on snow or on water.'),
      n('Diffuse', 'Light spread out evenly with no clear source, like an overcast sky.'),
      n('Hazy', 'Light softened by a veil, like sun through mist or smoke.'),
      n('Dappled', 'Patches of light and shade mixed together, like sun through leaves.'),
      n('Halo-like', 'A ring or soft edge of light around something darker or brighter.'),
    ] },
    { label: 'Change over time', words: [
      o('Fading'), o('Intensifying'),
      n('Dimming', 'Light getting lower and lower, like a room as the lamp is turned down.'),
      n('Dawning', 'Light slowly arriving, like the sky before sunrise.'),
      n('Waning', 'Light that is shrinking or draining away, like the moon after full.'),
      n('Surging', 'Light that rises suddenly and strongly, then may settle.'),
      n('Breathing', 'Light that slowly rises and falls in a long, even wave.'),
    ] },
    { label: 'Clarity and edge', words: [
      n('Clear', 'Light with nothing between you and what it shows, like a bright, cool morning.'),
      n('Sharp', 'Light with hard, exact edges and strong contrast.'),
      n('Soft-edged', 'Light that blends gently into what is around it, with no hard lines.'),
      n('Veiled', 'Light partly covered or filtered, so things are seen only in part.'),
      n('Murky', 'Light that is cloudy and thick, hard to see through, like muddy water.'),
      n('Piercing', 'Narrow, intense light that cuts through, like a beam in the dark.'),
      n('Harsh', 'Bright, flat light with no gentleness, like a bare bulb or midday glare.'),
    ] },
    { label: 'Warmth and brightness', words: [
      n('Warm', 'Light on the golden, amber or red side, like a fire or late afternoon.'),
      n('Cool', 'Light on the blue or silver side, like shade, moonlight or early morning.'),
      n('Golden', 'Rich yellow light, like low sun or honey held up to a window.'),
      n('Brilliant', 'Very bright and full, almost too much to look at directly.'),
      n('Dim', 'Low light, just enough to see by, like a room at dusk.'),
      n('Dark', 'Little or no light, where shapes are hard to make out.'),
    ] },
  ],

  // ───────────────────────── Sound: timbre (the character of a tone) ─────────────────────────
  timbre: [
    { label: 'Brightness', words: [
      o('Bright'),
      n('Dark', 'A tone with the high edges taken off, deep and shadowed, like a low cello.'),
      n('Clear', 'A clean tone with nothing blurring it, like a bell or a still voice.'),
      n('Crisp', 'A tone with a clean, quick start, like a snap or a tap on glass.'),
      n('Sharp', 'A tone with a hard, narrow edge that stands out.'),
      n('Piercing', 'A high, penetrating tone that is hard to ignore, like a whistle.'),
      n('Shrill', 'A very high, thin and strident tone, like a scream or a kettle.'),
    ] },
    { label: 'Body and weight', words: [
      o('Rich'), o('Thin'), o('Hollow'),
      n('Full', 'A tone that fills the space, with many layers in it.'),
      n('Round', 'A tone with no corners, soft at the start and the end, like a flute in its low range.'),
      n('Heavy', 'A weighty tone that presses down, like a low drum or a large door closing.'),
      n('Light', 'A tone that seems to weigh almost nothing, like a feather of sound.'),
      n('Booming', 'A big, deep tone that shakes the air, like thunder or a bass drum.'),
    ] },
    { label: 'Texture', words: [
      n('Smooth', 'A tone with no roughness, like a long note on a bowed string.'),
      n('Velvety', 'A soft, deep tone with a plush feel, like a low voice speaking close by.'),
      n('Silky', 'A fine, gliding tone, slippery and light.'),
      n('Raspy', 'A tone with a dry, rough grain in it, like a worn voice.'),
      n('Gritty', 'A tone with small hard particles in it, like sand or distortion.'),
      n('Buzzing', 'A tone with a fast rattle in it, like bees or an electric hum.'),
      n('Fuzzy', 'A tone with blurred, soft edges, like sound through a thick blanket.'),
      n('Muffled', 'A tone that seems covered or far away, like sound through a wall.'),
    ] },
    { label: 'Character', words: [
      o('Warm'), o('Resonant'), o('Metallic'), o('Breathy'),
      n('Airy', 'A tone with a lot of air in it, light and open, like a breeze through a pipe.'),
      n('Whispery', 'A tone that is mostly breath, quiet and close.'),
      n('Glassy', 'A smooth, bright and fragile tone, like a finger on the rim of a glass.'),
      n('Bell-like', 'A tone that starts with a strike and then rings and slowly fades.'),
      n('Wooden', 'A dry, warm, knocking tone, like a drum of wood or a marimba.'),
      n('Reedy', 'A tone with a slightly buzzing edge, like an oboe, clarinet or accordion.'),
      n('Nasal', 'A tone that seems to come through the nose, narrow and bright.'),
      n('Echoing', 'A tone that comes back to you, as in a large room or across a valley.'),
    ] },
  ],

  // ───────────────────────── Sound: rhythm ─────────────────────────
  rhythm: [
    { label: 'Even and regular', words: [
      o('Steady'), o('Pulsing'),
      n('Measured', 'Careful, even beats, each one given its time.'),
      n('Marching', 'Firm, evenly spaced beats, like footsteps in a line.'),
      n('Heartbeat-like', 'A repeated pair of beats with a short pause, like a pulse.'),
      n('Cyclical', 'A pattern that comes round and starts again, like waves or a wheel.'),
      n('Tidal', 'A slow rise and fall that takes a long time to turn.'),
    ] },
    { label: 'Smooth and swaying', words: [
      o('Flowing'), o('Languid'),
      n('Lilting', 'A light, rising and falling lilt, like a lullaby or a swing.'),
      n('Swaying', 'A gentle side-to-side movement, like branches in a breeze.'),
      n('Rocking', 'A back-and-forth movement, slow and soothing, like a cradle or a boat.'),
      n('Rolling', 'Beats that run into each other, like waves or a wheel on a road.'),
      n('Floating', 'A rhythm that hardly touches the ground, with no hard beats.'),
      n('Free', 'No fixed beat at all, following its own time.'),
    ] },
    { label: 'Fast and driving', words: [
      o('Urgent'),
      n('Racing', 'Beats that tumble over each other, fast and hard to keep up with.'),
      n('Driving', 'A strong, forward-pushing beat that does not let up.'),
      n('Relentless', 'A beat that goes on and on with no rest in it.'),
      n('Frantic', 'Fast, scattered and anxious beats, without a settled place.'),
      n('Insistent', 'A beat that keeps returning to the same point, as if asking for attention.'),
      n('Bouncing', 'Springy beats that rebound, like a ball.'),
      n('Skipping', 'Light, uneven steps, with a hop in them.'),
    ] },
    { label: 'Broken and uneven', words: [
      o('Syncopated'), o('Staccato'), o('Irregular'),
      n('Halting', 'A rhythm that stops and starts, as if unsure.'),
      n('Stumbling', 'A rhythm that trips over itself and recovers.'),
      n('Hesitant', 'Beats that come late or tentatively, with space before each.'),
      n('Dragging', 'A beat that lags behind where it should be, heavy and slow.'),
      n('Stop and start', 'Stretches of rhythm broken by silence, then beginning again.'),
      n('Fading in and out', 'A rhythm that comes and goes, nearer and then farther away.'),
    ] },
  ],

  // ───────────────────────── Essence: taste ─────────────────────────
  taste: [
    { label: 'Basic tastes', words: [
      o('Sweet'), o('Sour'), o('Salty'), o('Bitter'), o('Umami'),
    ] },
    { label: 'Between tastes', words: [
      n('Bittersweet', 'Sweet and bitter at once, like dark chocolate or burnt sugar.'),
      n('Tart', 'A bright, sharp sourness, like an unripe berry or a lemon rind.'),
      n('Tangy', 'A lively, slightly sour taste with some sweetness, like yogurt or citrus.'),
      n('Savory', 'Full and meaty or salty, not sweet, like broth, roasted food or cheese.'),
      n('Briny', 'Salty like the sea, or like a pickle or an olive.'),
      n('Acidic', 'A sharp sourness that makes the mouth water, like vinegar.'),
    ] },
    { label: 'Feelings in the mouth', words: [
      o('Astringent'), o('Pungent'), o('Metallic'),
      n('Peppery', 'A warm bite at the back of the tongue or throat, like black pepper.'),
      n('Burning', 'Strong heat in the mouth, like a chili pepper.'),
      n('Cooling', 'A fresh, cool feeling, as with mint or menthol.'),
      n('Minty', 'Cool, sweet and clean, like fresh mint or toothpaste.'),
      n('Tingly', 'A fizzy or prickling feeling, like soda or Sichuan pepper.'),
      n('Numbing', 'A feeling that the mouth is going quiet or less sensitive, like clove oil.'),
      n('Dry', 'A drying, puckering feeling, as after unripe fruit or strong tea.'),
      n('Creamy', 'A smooth, thick and soft feeling, like cream or ripe avocado.'),
      n('Fatty', 'A coating richness, like butter, oil or fat on meat.'),
      n('Juicy', 'Wet and bursting, like ripe fruit.'),
      n('Syrupy', 'Thick, slow and very sweet, like honey or syrup.'),
      n('Chalky', 'Dry and powdery, like chalk or some medicines.'),
    ] },
    { label: 'Flavor families', words: [
      n('Fruity', 'The taste of fruit of any kind, ripe and sweet or sharp.'),
      n('Nutty', 'A warm, round, slightly oily taste, like almonds or toasted seeds.'),
      n('Earthy', 'The taste of soil and roots, like beets, mushrooms or cocoa.'),
      n('Toasted', 'A dry, golden, cooked taste, like bread crust or roasted grains.'),
      n('Caramelized', 'Sugar cooked until it is deep and slightly bitter, like caramel or sautéed onions.'),
      n('Smoky', 'The taste of smoke or fire, like grilled food or smoked tea.'),
      n('Fermented', 'A deep, sour and sometimes funky taste, like kimchi, yogurt or aged cheese.'),
      n('Bland', 'Little taste at all, plain and quiet.'),
      n('Ashy', 'A dry, burnt taste, like ash or over-charred food.'),
    ] },
  ],

  // ───────────────────────── Essence: scent ─────────────────────────
  scent: [
    { label: 'Flowers', words: [
      o('Floral'),
      n('Rose-like', 'Soft, sweet and slightly powdery, like rose petals.'),
      n('Jasmine-like', 'Rich, sweet and heady, like jasmine at night.'),
      n('Lavender', 'Clean, herbal and calming, like dried lavender in a drawer.'),
      n('Blossoming', 'Sweet and fresh, like orchard flowers in spring.'),
      n('Honeyed', 'Warm and sweet, with a golden, waxy edge.'),
    ] },
    { label: 'Fruit', words: [
      o('Citrus'),
      n('Lemony', 'Sharp, clean and bright, like lemon peel.'),
      n('Orange peel', 'Sweet, bright and oily, like the peel of an orange.'),
      n('Fruity', 'The smell of ripe fruit of any kind.'),
      n('Berry', 'Sweet and slightly tart, like strawberries or blackberries.'),
      n('Apple', 'Fresh, crisp and lightly sweet.'),
      n('Tropical', 'Warm, sweet and thick, like mango, pineapple or coconut.'),
      n('Overripe', 'Fruit that is soft, very sweet and starting to turn.'),
    ] },
    { label: 'Green and herbal', words: [
      o('Herbal'),
      n('Green', 'The smell of fresh leaves and stems, like a snapped branch.'),
      n('Grassy', 'Freshly cut grass or a meadow.'),
      n('Leafy', 'Tea leaves, tomato vines or garden greens.'),
      n('Minty', 'Cool, sweet and sharp, like fresh mint.'),
      n('Tea-like', 'Dry leaves steeped in hot water, gentle and tannic.'),
      n('Hay-like', 'Dry, sweet grass in the sun.'),
    ] },
    { label: 'Spice', words: [
      o('Spicy'),
      n('Peppery', 'Dry, sharp and tickling, like freshly ground pepper.'),
      n('Cinnamon-like', 'Warm, sweet and woody, like a baking spice.'),
      n('Clove', 'Strong, sweet and slightly medicinal, like cloves.'),
      n('Vanilla', 'Soft, creamy and sweet.'),
      n('Anise', 'Sweet and cool like licorice or fennel.'),
      n('Ginger', 'Bright, warm and zesty, with a little bite.'),
    ] },
    { label: 'Wood and resin', words: [
      o('Woody'),
      n('Cedar', 'Dry, clean and slightly sweet, like a cedar chest or pencils.'),
      n('Pine', 'Sharp, fresh and resinous, like a pine forest.'),
      n('Resinous', 'Sticky and aromatic, like sap or pine pitch.'),
      n('Sandalwood', 'Soft, creamy and warm wood.'),
      n('Incense', 'Smoky, sweet, resinous smoke, like a temple or church.'),
      n('Sawdust', 'Dry, pale and fresh from a workshop.'),
    ] },
    { label: 'Earth and mineral', words: [
      o('Earthy'),
      n('Mossy', 'Cool, damp and green, like moss on stone.'),
      n('Mushroomy', 'Damp, dark and savory, like a forest floor after rain.'),
      n('Damp', 'Moist air and wet materials, like a basement or a wet towel.'),
      n('Mineral', 'Cool and clean, like wet stone or a river rock.'),
      n('Rain-like', 'The smell of rain on dry ground.'),
      n('Dusty', 'Dry, fine and still, like an old attic or a closed room.'),
      n('Clay', 'Cool and soft, like wet earth or a pottery studio.'),
      n('Musty', 'Stale, closed in and a little sour, like old books or an unopened cupboard.'),
    ] },
    { label: 'Smoke and fire', words: [
      o('Smoky'),
      n('Campfire', 'Wood smoke in open air, with a warm, sweet edge.'),
      n('Burnt', 'Something scorched, sharp and bitter.'),
      n('Charred', 'Black and crisp, like the edge of grilled food.'),
      n('Roasted', 'Deep, warm and toasted, like coffee beans or nuts.'),
      n('Tarry', 'Thick, black and sticky, like fresh asphalt or pipe smoke.'),
      n('Ashy', 'Cold ash after a fire has gone out.'),
    ] },
    { label: 'Water and air', words: [
      o('Fresh'), o('Ocean'),
      n('Salty air', 'Sea spray and wind, bright and a little sharp.'),
      n('Clean', 'No smell but cleanliness, like fresh laundry or rinsed skin.'),
      n('Crisp', 'Cold, thin, clear air, like a frosty morning.'),
      n('Snow-like', 'Cold, clean and almost nothing, like air after snowfall.'),
      n('Wet leaves', 'Damp autumn ground and slowly turning leaves.'),
    ] },
    { label: 'Warm and sweet', words: [
      o('Sweet'),
      n('Honey', 'Thick, golden and floral-sweet.'),
      n('Caramel', 'Sweet, buttery, slightly burnt sugar.'),
      n('Baked', 'Warm bread, cake or biscuits from an oven.'),
      n('Buttery', 'Rich, soft and creamy, like warm butter.'),
      n('Coffee', 'Dark, roasted and a little bitter.'),
      n('Chocolate', 'Deep, sweet and slightly bitter cocoa.'),
      n('Nutty', 'Warm, round and oily, like almonds or walnuts.'),
    ] },
    { label: 'Skin, leather and animal', words: [
      o('Musky'),
      n('Leathery', 'Dry, dark, warm hide, like a new jacket or an old saddle.'),
      n('Woolly', 'Warm, thick and a little greasy, like wool or a sheep.'),
      n('Warm skin', 'The closeness of a person or an animal, warm and soft.'),
      n('Barnyard', 'Hay, animals and earth together, strong and warm.'),
    ] },
    { label: 'Sharp and chemical', words: [
      o('Sharp'),
      n('Vinegary', 'Sharp, sour and eye-watering.'),
      n('Medicinal', 'Clean, strong and slightly bitter, like antiseptic or cough syrup.'),
      n('Soapy', 'Clean and floral, a little flat, like fresh soap.'),
      n('Metallic', 'Cold and sharp, like coins, blood or a wet tool.'),
      n('Chemical', 'Strong, thin and artificial, like paint, solvent or cleaning fluid.'),
      n('Rubbery', 'Warm and tarry, like a new tire or a rubber band.'),
      n('Stale', 'Old air or food, flat and tired.'),
      n('Rotting', 'Something spoiled, sour and heavy.'),
    ] },
  ],

  // ───────────────────────── Insight: pattern ─────────────────────────
  pattern: [
    { label: 'Lines and paths', words: [
      o('Linear'), o('Branching'),
      n('Zigzag', 'A path that turns sharply from side to side, like lightning or a folded paper.'),
      n('Wavy', 'A smooth line rising and falling, like water or a ribbon.'),
      n('Looping', 'A path that curls back and crosses itself.'),
      n('Winding', 'A long path with many gentle bends, like a river or mountain road.'),
      n('Maze-like', 'Paths that turn, split and double back, with dead ends.'),
      n('Striped', 'Parallel bands side by side.'),
    ] },
    { label: 'Circles and spirals', words: [
      o('Circular'), o('Spiraling'),
      n('Concentric', 'Rings inside rings around one center, like ripples or tree rings.'),
      n('Radiating', 'Lines spreading out from one center, like sun rays or a spider\'s thread.'),
      n('Ripple-like', 'Waves moving outward from a disturbance.'),
      n('Cyclical', 'Something that comes round and begins again.'),
    ] },
    { label: 'Order and repetition', words: [
      o('Layered'), o('Crystalline'), o('Fractal'),
      n('Grid-like', 'Rows and columns crossing at right angles, like a window or a city map.'),
      n('Repeating', 'The same shape or beat appearing again and again.'),
      n('Symmetrical', 'One side mirrors the other.'),
      n('Tessellated', 'Shapes fitted together with no gaps, like tiles.'),
      n('Nested', 'Smaller versions inside bigger ones, like nesting dolls.'),
      n('Woven', 'Threads passing over and under each other, like cloth.'),
      n('Interlocking', 'Pieces that fit into each other so they hold together.'),
      n('Geometric', 'Clean, exact shapes, like triangles, squares and circles.'),
      n('Stacked', 'Pieces placed one on top of another.'),
    ] },
    { label: 'Scattered and tangled', words: [
      o('Fragmented'), o('Chaotic'), o('Web-like'),
      n('Scattered', 'Pieces spread widely with no clear order, like seeds thrown.'),
      n('Clustered', 'Things gathered in groups with space between.'),
      n('Tangled', 'Lines crossing and knotting, hard to follow, like wire or hair.'),
      n('Knotted', 'Lines pulled tight on themselves.'),
      n('Cracked', 'A surface broken in many thin lines, like dry earth or old paint.'),
      n('Dotted', 'Many small separate points.'),
      n('Mosaic', 'Many small different pieces that together form a picture.'),
    ] },
    { label: 'Wholes and change', words: [
      o('Unified'),
      n('Organic', 'Shapes that grow and curve naturally, like leaves, bones or clouds.'),
      n('Cellular', 'Many small, connected compartments, like a honeycomb or foam.'),
      n('Emerging', 'A pattern becoming visible slowly, like a picture in fog.'),
      n('Dissolving', 'A pattern losing its shape, coming apart slowly.'),
      n('Layered over', 'One pattern lying on top of another, partly hiding it.'),
    ] },
  ],

  // ───────────────────────── Insight: perspective ─────────────────────────
  perspective: [
    { label: 'Near and far', words: [
      o('Microscopic'), o('Telescopic'),
      n('Close-up', 'Standing very near, seeing small details clearly.'),
      n('Distant', 'Looking from far away, so details blur and the shape is clear.'),
      n('Zoomed in', 'Attention narrowed to one small thing.'),
      n('Zoomed out', 'Attention widened to the whole picture.'),
    ] },
    { label: 'Width and focus', words: [
      o('Narrow'), o('Focused'), o('Panoramic'),
      n('Wide-angle', 'A broad view that takes in a lot at once, though the edges bend.'),
      n('Peripheral', 'Seeing mainly at the edges, with the center left empty.'),
      n('Tunnel-like', 'A narrow view with dark around the edges.'),
      n('Spacious', 'A view with lots of room in it.'),
    ] },
    { label: 'Where you stand', words: [
      o("Bird's Eye"), o('Immersed'),
      n('From above', 'Looking down on things from higher up.'),
      n('From below', 'Looking up at things from lower down.'),
      n('From the side', 'Looking at things sideways, from one flank.'),
      n('Inside looking out', 'Being within something and looking out through its edge.'),
      n('Outside looking in', 'Standing outside something and seeing in through its edge.'),
      n('Watching from a distance', 'Observing as if from the edge of the room, not taking part.'),
      n('Right in the middle', 'Being at the center of what is happening.'),
    ] },
    { label: 'Time and direction', words: [
      n('Looking back', 'Facing what has already happened.'),
      n('Looking ahead', 'Facing what is still to come.'),
      n('In the present moment', 'Seeing only what is here and now.'),
      n('From another\'s point of view', 'Imagining how it looks from someone else\'s place.'),
    ] },
    { label: 'How clear it is', words: [
      o('Multi-faceted'),
      n('Through a window', 'Seen through glass, clear but separate.'),
      n('Through fog', 'Seen through mist, with shapes but no detail.'),
      n('Through water', 'Seen through moving water, bending and rippling.'),
      n('Reflected', 'Seen in a mirror or in still water, turned around.'),
      n('Kaleidoscopic', 'Seen in many shifting, repeated pieces.'),
      n('Cloudy', 'Hard to see clearly, with a thick veil over it.'),
    ] },
  ],

  // ───────────────────────── Movement: direction ─────────────────────────
  direction: [
    { label: 'Up and down', words: [
      o('Upward'), o('Downward'),
      n('Rising', 'Moving gradually upward, like steam or the sun at dawn.'),
      n('Lifting', 'Being raised by something, with weight leaving.'),
      n('Falling', 'Dropping with little control, like a leaf or a stone.'),
      n('Sinking', 'Going slowly down and under, like a stone in water.'),
      n('Collapsing', 'Folding in on itself and giving way.'),
    ] },
    { label: 'In and out', words: [
      o('Inward'), o('Outward'), o('Expansive'), o('Contracting'),
      n('Opening', 'Unfolding, like a flower, a door or a hand.'),
      n('Closing', 'Folding up, shutting, like a hand or a door.'),
      n('Spreading', 'Moving outward and thinner, like a stain or a rumor.'),
      n('Gathering', 'Coming together, drawing things in.'),
      n('Pulling together', 'Parts moving toward each other.'),
      n('Pulling apart', 'Parts moving away from each other.'),
      n('Converging', 'Many paths moving toward one point.'),
      n('Scattering', 'Spreading in every direction, like birds startled up.'),
    ] },
    { label: 'Along a path', words: [
      n('Forward', 'Moving ahead, toward what is in front.'),
      n('Backward', 'Moving back, away from what is in front.'),
      n('Sideways', 'Moving across, not toward or away.'),
      n('Diagonal', 'Moving at a slant, both up and across.'),
      n('Advancing', 'Moving toward something steadily.'),
      n('Retreating', 'Moving back, away from something.'),
      n('Toward something', 'Drawn in a direction, as toward a light or a person.'),
      n('Away from something', 'Pulled out of a place, away from what is there.'),
    ] },
    { label: 'Around and back', words: [
      o('Spiraling'), o('Oscillating'),
      n('Circling', 'Going round and round a point.'),
      n('Orbiting', 'Circling something, held by its pull.'),
      n('Rotating', 'Turning on an axis, like a wheel.'),
      n('Looping', 'Going round and returning to near where it began.'),
      n('Swaying', 'Leaning slowly from side to side.'),
      n('Rocking', 'Tilting back and forth.'),
    ] },
    { label: 'Pushing, pulling, staying', words: [
      o('Flowing'), o('Stuck'), o('Still'),
      n('Pushing', 'Pressing against something to move it.'),
      n('Pulling', 'Drawing something toward you, or being drawn.'),
      n('Stretching', 'Reaching longer, lengthening between two points.'),
      n('Folding', 'Bending in on itself in layers.'),
      n('Drifting', 'Moving slowly with no steering, carried along.'),
      n('Hovering', 'Staying in the air, neither rising nor falling.'),
      n('Dissolving', 'Losing edges and spreading until it can no longer be traced.'),
    ] },
  ],

  // ───────────────────────── Movement: quality ─────────────────────────
  quality: [
    { label: 'Smooth and soft', words: [
      o('Fluid'), o('Graceful'), o('Gentle'),
      n('Smooth', 'Even and unbroken, without bumps.'),
      n('Effortless', 'Moving without strain, as if carried.'),
      n('Floating', 'Light and unsupported, as if on water or air.'),
      n('Buoyant', 'Lifted up by something below, springing back to the top.'),
      n('Light', 'Hardly any weight, quick to change.'),
      n('Relaxed', 'Loose, without effort or holding.'),
      n('Loose', 'Free in the joints, easy and unfixed.'),
      n('Wavelike', 'Rising and falling in a long, smooth pattern.'),
    ] },
    { label: 'Strong and heavy', words: [
      o('Forceful'), o('Determined'),
      n('Heavy', 'Moving with great weight, hard to lift or turn.'),
      n('Weighted', 'Pressed down, as though carrying something.'),
      n('Sustained', 'Held on at the same strength, without letting go.'),
      n('Pressing', 'A steady push forward against resistance.'),
      n('Driven', 'Pushed on by something from behind.'),
    ] },
    { label: 'Sudden and rough', words: [
      o('Jerky'), o('Turbulent'),
      n('Sudden', 'Happening all at once, with no warning.'),
      n('Quick', 'Fast to begin and fast to end.'),
      n('Fast', 'Covering ground in very little time.'),
      n('Frantic', 'Fast, scattered and hard to stop.'),
      n('Restless', 'Unable to settle, always shifting.'),
      n('Clumsy', 'Awkward, bumping against things.'),
      n('Shaky', 'Unsteady, with small, rapid wobbles.'),
      n('Trembling', 'A fine, quick shaking, like cold or nervous energy.'),
      n('Wobbly', 'Rocking, not quite able to hold its balance.'),
      n('Vibrating', 'Moving very fast in a small space, like a string.'),
    ] },
    { label: 'Slow and held', words: [
      o('Hesitant'),
      n('Slow', 'Taking a long time to cover a little ground.'),
      n('Sluggish', 'Slow and heavy, as if through mud.'),
      n('Cautious', 'Careful, watching each step.'),
      n('Tense', 'Held tight, ready to spring or break.'),
      n('Tight', 'Pulled in close, with little room.'),
      n('Rigid', 'Stiff and unbending, hard to move.'),
      n('Bracing', 'Getting ready for an impact.'),
      n('Strained', 'Working hard against resistance, near the limit.'),
      n('Frozen', 'Held fixed in place, as if turned to ice.'),
    ] },
    { label: 'Playful and reaching', words: [
      n('Playful', 'Light, curious and a little unexpected, like a puppy or a child.'),
      n('Rhythmic', 'Moving in a regular, repeating beat.'),
      n('Reaching', 'Stretching toward something just out of range.'),
      n('Springy', 'Pressing down and bouncing back.'),
      n('Searching', 'Moving this way and that, looking for something.'),
    ] },
  ],
};

/** The flat list of words for a category, in group order (what the pages and the wheel use). */
export const wordsOf = (category: SenseCategory): string[] => SENSE_WORDS[category].flatMap((g) => g.words.map((w) => w.term));

/** The description written here for a new word, or undefined (the original words are described in TermInfo.tsx). */
export function senseDescription(category: SenseCategory, term: string): string | undefined {
  for (const g of SENSE_WORDS[category]) for (const w of g.words) if (w.term === term) return w.description;
  return undefined;
}

/** The first words each list began with: the ones a wheel shows, and whose descriptions are in TermInfo.tsx. */
export const ORIGINAL_WORDS: Record<SenseCategory, string[]> = {
  lightQuality: ['Steady', 'Pulsing', 'Flickering', 'Glowing', 'Shimmering', 'Radiating', 'Fading', 'Intensifying'],
  timbre: ['Resonant', 'Hollow', 'Bright', 'Warm', 'Metallic', 'Breathy', 'Rich', 'Thin'],
  rhythm: ['Steady', 'Syncopated', 'Flowing', 'Staccato', 'Irregular', 'Pulsing', 'Languid', 'Urgent'],
  taste: ['Bitter', 'Sweet', 'Sour', 'Salty', 'Umami', 'Astringent', 'Pungent', 'Metallic'],
  scent: ['Earthy', 'Floral', 'Citrus', 'Woody', 'Smoky', 'Musky', 'Fresh', 'Spicy', 'Sweet', 'Sharp', 'Herbal', 'Ocean'],
  pattern: ['Fragmented', 'Linear', 'Branching', 'Circular', 'Layered', 'Web-like', 'Crystalline', 'Fractal', 'Spiraling', 'Chaotic', 'Unified'],
  perspective: ['Narrow', 'Focused', 'Panoramic', 'Microscopic', 'Telescopic', 'Multi-faceted', "Bird's Eye", 'Immersed'],
  direction: ['Upward', 'Downward', 'Inward', 'Outward', 'Expansive', 'Contracting', 'Spiraling', 'Oscillating', 'Flowing', 'Stuck', 'Still'],
  quality: ['Fluid', 'Jerky', 'Graceful', 'Forceful', 'Hesitant', 'Determined', 'Gentle', 'Turbulent'],
};
