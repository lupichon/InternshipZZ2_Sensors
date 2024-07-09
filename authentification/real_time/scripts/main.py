import real_time.scripts.wiiboard as wiiboard
import pygame

board = wiiboard.Wiiboard()

x = 0
y = 0

find = True
running = True

def main():
	"""
    Main function to initialize pygame, discover/connect to Wiiboard, and handle events.

    This function:
    - Initializes pygame and discovers a nearby Wiiboard.
    - Connects to the Wiiboard, turns on its LED, and enters an event loop.
    - Handles Wiiboard mass events to update center of mass coordinates (x, y).
    - Prints messages for Wiiboard button press/release events.
    - Disconnects from the Wiiboard when it's disconnected or not found during discovery.
    - Cleans up pygame resources before exiting.

    Returns:
    None
    """
	
	global x, y, find, running
	pygame.init()

	address = board.discover()
	if address is not None : 
		board.connect(address) 
		board.setLight(True)
		running = True
	else : 
		running = False
		find = False
	
	while(running and board.status == "Connected"):
		for event in pygame.event.get():
			if event.type == wiiboard.WIIBOARD_MASS:
				if event.type == wiiboard.WIIBOARD_MASS:
					x = event.mass.CoMx
					y = event.mass.CoMy
			elif event.type == wiiboard.WIIBOARD_BUTTON_PRESS:
				print("Button pressed!")

			elif event.type == wiiboard.WIIBOARD_BUTTON_RELEASE:
				print("Button released")

			elif event.type == wiiboard.WIIBOARD_DISCONNECTED:
				board.disconnect()
				break
			
	if running == False : 
		board.disconnect()
	pygame.quit()
	
if __name__ == "__main__":
	main()