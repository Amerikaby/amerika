/* Примерные лоты в формате AuctionsAPI (/cars). Показываются, пока на сервере нет ключа API.
   Даты торгов считаются от текущего момента, чтобы таймеры выглядели живыми. */
(function () {
  var H = 3600e3, now = Date.now();
  function at(hours) { return new Date(now + hours * H).toISOString(); }
  var mk = {
    chevrolet: { id: 21, name: 'Chevrolet' }, nissan: { id: 72, name: 'Nissan' }, ford: { id: 33, name: 'Ford' },
    vw: { id: 101, name: 'Volkswagen' }, buick: { id: 15, name: 'Buick' }, audi: { id: 7, name: 'Audi' },
    alfa: { id: 3, name: 'Alfa Romeo' }, toyota: { id: 97, name: 'Toyota' }, hyundai: { id: 42, name: 'Hyundai' }
  };
  var n = 0;
  function car(o) {
    n++;
    var copart = o.src !== 'iaai';
    var img = o.img ? ['../new/img/' + o.img] : [];
    return {
      id: 17000000 + n, vin: o.vin, year: o.year, title: o.year + ' ' + o.make.name + ' ' + o.model,
      manufacturer: o.make, model: { id: 5000 + n, name: o.model, manufacturer_id: o.make.id }, generation: null,
      body_type: { name: o.body || 'suv', id: o.body === 'sedan' ? 1 : 5 }, color: { name: o.color || 'white', id: 13 },
      engine: { id: 1, name: o.engine }, transmission: { name: 'automatic', id: 1 },
      drive_wheel: o.awd ? { name: 'all', id: 3 } : { name: 'front', id: 2 },
      vehicle_type: { name: 'automobile', id: 1 }, fuel: { name: o.fuel || 'gasoline', id: o.fuel === 'hybrid' ? 3 : 4 },
      cylinders: o.cyl || 4,
      lots: [{
        id: 18000000 + n, lot: o.lot, domain: copart ? { name: 'copart_com', id: 3 } : { name: 'iaai_com', id: 1 },
        external_id: copart ? null : String(40000000 + n),
        odometer: { km: Math.round(o.mi * 1.609), mi: o.mi, status: { name: o.odo || 'actual', id: o.odo ? 2 : 1 } },
        sale_date: o.sale == null ? null : at(o.sale), bid: o.bid || 0, buy_now: o.buyNow || 0,
        final_bid: o.final || null, seller_reserve: o.reserve ? { price: o.reserve, updated_at: at(-5) } : null,
        status: o.status || { name: 'sale', id: 3 },
        auction_type: { name: 'live', id: 4 },
        pre_accident_price: o.acv || null, actual_cash_value: o.acv || null, estimate_repair_price: o.repair || null,
        seller: o.ins ? { id: 1, name: 'State Farm Insurance', is_insurance: true } : null,
        seller_type: o.ins ? { name: 'insurance', id: 1 } : { name: 'non_insurance', id: 2 },
        title: { id: 1, code: null, name: o.titleDoc || 'Clean Title' },
        detailed_title: null,
        damage: { main: { id: 1, name: o.dmg }, second: o.dmg2 ? { id: 2, name: o.dmg2 } : null },
        keys_available: o.keys !== false, airbags: { name: o.airbags || 'intact', id: o.airbags ? 2 : 1 },
        condition: o.cond === 0 || o.cond == null ? { name: 'run_and_drives', id: 0 } : { name: 'engine_starts', id: 6 },
        images: { id: n, small: img, normal: img, big: img, downloaded: [], exterior: null, interior: null, video: null, video_youtube_id: null, external_panorama_url: null },
        location: {
          country: { iso: 'us', name: 'USA' }, state: { id: 1, code: o.st, name: o.st },
          city: { id: 1, name: o.city }, location: { id: 1, name: o.st + ' - ' + o.city }, raw: o.st + ' - ' + o.city
        },
        selling_branch: { id: 1, name: o.st + ' - ' + o.city, link: null, number: null, domain_id: copart ? 3 : 1 },
        line: 'A/' + (10 + n), tags: [], is_timed_auction: false,
        prices: o.history || []
      }]
    };
  }
  window.SAMPLE_CARS = [
    car({ make: mk.chevrolet, model: 'Equinox LT', year: 2021, vin: '3GNAXUEV1ML312401', lot: '71834925', img: 'chevrolet-equinox.jpg', engine: '1.5l 4', mi: 38412, dmg: 'Front End', sale: 26, bid: 4250, reserve: 6900, acv: 19850, repair: 7420, st: 'tx', city: 'houston', ins: true, awd: true,
      history: [{ id: 1, lot_id: 1, bid: 3900, buy_now_price: null, sale_date: at(-170), status: { name: 'not_sold', id: 8 } }] }),
    car({ make: mk.chevrolet, model: 'Trailblazer LT', year: 2022, vin: 'KL79MPSL4NB045112', lot: '72110384', engine: '1.3l 3', cyl: 3, mi: 21980, dmg: 'Rear End', sale: 49, bid: 6100, buyNow: 9800, acv: 21400, st: 'ga', city: 'atlanta south', src: 'iaai', ins: true }),
    car({ make: mk.nissan, model: 'Rogue SV', year: 2021, vin: 'JN8AT3BB4MW218865', lot: '69447712', img: 'nissan-rogue.jpg', engine: '2.5l 4', mi: 44120, dmg: 'Side', dmg2: 'Minor Dent/Scratches', sale: 5, bid: 7800, reserve: 9200, acv: 22300, st: 'fl', city: 'miami north', ins: true, awd: true }),
    car({ make: mk.ford, model: 'Bronco Sport Big Bend', year: 2022, vin: '3FMCR9B66NRD10234', lot: '73560019', engine: '1.5l 3', cyl: 3, mi: 18350, dmg: 'Hail', sale: 74, bid: 0, acv: 26900, st: 'co', city: 'denver', awd: true }),
    car({ make: mk.chevrolet, model: 'Trax LS', year: 2024, vin: 'KL77LFE24RC118420', lot: '43098541', engine: '1.2l 3', cyl: 3, mi: 6120, dmg: 'Front End', sale: 30, bid: 5400, buyNow: 11500, st: 'nj', city: 'trenton', src: 'iaai', ins: true }),
    car({ make: mk.vw, model: 'Jetta S', year: 2020, vin: '3VWC57BU5LM061922', lot: '70921457', body: 'sedan', engine: '1.4l 4', mi: 61240, dmg: 'Minor Dent/Scratches', sale: 3, bid: 3550, reserve: 4800, acv: 13200, st: 'pa', city: 'philadelphia', titleDoc: 'Salvage Certificate' }),
    car({ make: mk.ford, model: 'Edge SEL', year: 2020, vin: '2FMPK4J94LBA41876', lot: '68230931', img: 'ford-edge.jpg', engine: '2.0l 4', mi: 52300, dmg: 'Front End', dmg2: 'Mechanical', sale: -30, bid: 5900, final: 5900, status: { name: 'sold', id: 6 }, acv: 18700, st: 'oh', city: 'columbus', ins: true, awd: true }),
    car({ make: mk.buick, model: 'Encore GX Select', year: 2021, vin: 'KL4MMDSL9MB091734', lot: '41256803', img: 'buick-encore-gx.jpg', engine: '1.3l 3', cyl: 3, mi: 29870, dmg: 'Rear End', sale: 52, bid: 4700, reserve: 6300, st: 'il', city: 'chicago north', src: 'iaai', ins: true, awd: true }),
    car({ make: mk.audi, model: 'A4 allroad Premium Plus', year: 2019, vin: 'WA18NAF42KA052611', lot: '72004418', img: 'audi-a4-allroad.jpg', body: 'wagon', engine: '2.0l 4', mi: 57710, dmg: 'Side', sale: 98, bid: 8250, acv: 27300, st: 'ca', city: 'san diego', awd: true }),
    car({ make: mk.alfa, model: 'Giulia Ti', year: 2020, vin: 'ZARFAMBN8L7627841', lot: '71566290', img: 'alfa-romeo-giulia.jpg', body: 'sedan', engine: '2.0l 4', mi: 33400, dmg: 'Water/Flood', sale: 20, bid: 3100, st: 'nc', city: 'raleigh', ins: true, cond: 6, airbags: 'deployed', titleDoc: 'Salvage Certificate', awd: true }),
    car({ make: mk.toyota, model: 'RAV4 XLE Hybrid', year: 2021, vin: '4T3RWRFV1MU029387', lot: '42877120', engine: '2.5l 4', mi: 47250, fuel: 'hybrid', dmg: 'Front End', sale: -20, bid: 11800, final: 11800, status: { name: 'not_sold', id: 8 }, st: 'az', city: 'phoenix', src: 'iaai', ins: true, awd: true }),
    car({ make: mk.hyundai, model: 'Tucson SEL', year: 2022, vin: '5NMJB3AE0NH114523', lot: '73901266', engine: '2.5l 4', mi: 24800, dmg: 'Front End', sale: 120, bid: 0, buyNow: 12900, acv: 24100, st: 'tx', city: 'dallas', ins: true }),
  ];
})();
