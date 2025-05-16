# created on 3/15/15 by Ron Pomper, updated 5/16.25 by Aja Altenhof
# updated to remove requirement for "norm_" prefix, takes local file paths, and places AGs/carriers first

# this script concatenates the targets (e.g., "Where's the dog?") 
# and attention getters ("That's cool!") inserting silence before, between, and afterwards

# the script is written such that it will combine a selected attention getter (ag$) with every target

# note: files no longer need "norm_" at the beginning of the filename

# specify the directory paths using just folder names
# Since your script is in the audio folder with these subdirectories
directory_for_targets$ = "another_targets"
directory_for_AG$ = "another_carriers"
directory_to_save$ = "concatenated_another"

# select the AG you want without .wav ending
ag$ = "tap_another3"

# enter the amount of silence to occur: 
# before sound onset, 
# between the target sentence and attention getter &
# after the offset of sound
before$ = "2"
between$ = "0.33"
after$ = "0.1"

#### everything below is automated ####

# get files in the to read directory
string = Create Strings as file list... files  'directory_for_targets$'/*.wav
numberOfSounds = Get number of strings

# Read the AG file once outside the loop
ag_sound = Read from file... 'directory_for_AG$'/'ag$'.wav

# open all files and save durations, pitches, and intensities to table
for i to numberOfSounds
    # Create silence before
    silence_before = Create Sound from formula: "silence_before", 1, 0, 'before$', 44100, "0"
    
    # Copy the AG sound 
    selectObject: ag_sound
    ag_copy = Copy... ag_copy
    
    # Create silence between
    silence_between = Create Sound from formula: "silence_between", 1, 0, 'between$', 44100, "0"
    
    # Read target file
    select string
    file$ = Get string... i
    file'i'$ = file$
    target_sound = Read from file... 'directory_for_targets$'/'file$'
    name$ = "'file$'" - ".wav"
    
    # Create silence after
    silence_after = Create Sound from formula: "silence_after", 1, 0, 'after$', 44100, "0"
    
    # Now select the sounds in the correct order for concatenation
    selectObject: silence_before
    plusObject: ag_copy
    plusObject: silence_between
    plusObject: target_sound
    plusObject: silence_after
    
    # Concatenate
    concatenated = Concatenate
    
    # Save the concatenated sound
    Write to WAV file... 'directory_to_save$'/'ag$'_'name$'.wav
    
    # Clean up this iteration
    Remove
    selectObject: ag_copy
    Remove
    selectObject: target_sound
    Remove
endfor

# Clean up
selectObject: ag_sound
Remove
selectObject: string
Remove