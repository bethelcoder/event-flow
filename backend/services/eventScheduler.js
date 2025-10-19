const cron = require("node-cron");
const Event = require("../models/Event");
const Guest = require("../models/Guest");
const Venue = require("../models/Venue");
const { DateTime} = require("luxon");
const sendNotification = require("./notificationService");
const { sendExtendPromptEmail, sendGuestNotification } = require("./emailService");

/**
 * Runs every minute to:
 * 1. Activate upcoming events.
 * 2. Notify guests 5 minutes before the event ends (respecting extendedUntil).
 * 3. End events automatically when endTime or extendedUntil passes.
 */
const startEventScheduler = () => {
  cron.schedule("* * * * *", async () => {
    const now = DateTime.now().setZone("Africa/Johannesburg");
    const fiveMinutesLater = now.plus({ minutes: 5 });
    

    try {
      // 1️⃣ Activate events automatically
      const toActivate = await Event.find({
        status: "upcoming",
        startTime: { $lte: now.toJSDate() },
      });
      
      for (const event of toActivate) {
        event.status = "active";
        await event.save();
        console.log(`🚀 Event "${event.name}" is now active.`);
      }

      // 2️⃣ Notify guests before event end (using extendedUntil if present)
      const endingSoonEvents = await Event.find({
        status: "active",
        $expr: {
          $and: [
            {
              $lte: [
                { $ifNull: ["$extendedUntil", "$endTime"] },
                fiveMinutesLater.toJSDate(),
              ],
            },
            {
              $gte: [
                { $ifNull: ["$extendedUntil", "$endTime"] },
                now.toJSDate(),
              ],
            },
          ],
        },
      });

      for (const event of endingSoonEvents) {
        if (!event.notifiedGuests) {
          console.log(`🔔 Notifying guests: Event "${event.name}" ending soon...`);

          const guests = await Guest.find({
            _id: { $in: event.guests.map((g) => g.guestId) },
          });

          for (const guest of guests) {
            await sendGuestNotification(
              guest.email,
              guest.fullName,
              event.name,
            );
          }

          event.notifiedGuests = true;
          await event.save();
        }

        // ✅ Prompt manager to extend event
          if (!event.promptedManager) {
            await sendExtendPromptEmail(event);
            event.promptedManager = true; // flag to avoid multiple prompts
            await event.save();
          }

      }

      // 3️⃣ End events automatically when endTime or extendedUntil passes
      const expiredEvents = await Event.find({
        status: "active",
        $expr: {
          $lte: [
            { $ifNull: ["$extendedUntil", "$endTime"] },
            now
          ],
        },
      });

      for (const event of expiredEvents) {
        event.status = "ended";
        
        const venue = await Venue.findById(event.venue.venueID);
        if (venue) {
            venue.booked = false;
            await venue.save();
        }
        await event.save();
        event.venue = null;

         const guests = await Guest.find({
            _id: { $in: event.guests.map((g) => g.guestId) },
          });

          for (const guest of guests) {
            guest.checkedIn = false;
            await guest.save();
          }
          
        console.log(`✅ Event "${event.name}" ended at ${now.toJSDate()}`);
      }

    } catch (error) {
      console.error("❌ Error in event scheduler:", error);
    }
  },
  {
    timezone: "Africa/Johannesburg"
  }

);
};

module.exports = startEventScheduler;